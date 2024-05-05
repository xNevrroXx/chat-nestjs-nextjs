import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import { AppConstantsService } from "../app.constants.service";
import * as path from "path";
import * as mime from "mime-types";
import { AuthGuard } from "../auth/auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "../s3/s3.service";
import { FileService } from "./file.service";
import { InjectS3, S3 } from "nestjs-s3";
import { FileType } from "@prisma/client";

@Controller("file")
export class FileController {
    constructor(
        @InjectS3() private readonly s3: S3,
        private readonly fileService: FileService,
        private readonly s3Service: S3Service,
        private appConstantsService: AppConstantsService
    ) {}

    @Get("download")
    async getAttachment(
        @Req() request: Request,
        @Res() response: Response,
        @Query("name") name: string
    ) {
        const filePath = path.join(
            this.appConstantsService.USERS_DATA_FOLDER_PATH,
            name as string
        );

        response.download(filePath);
    }

    @Post("/upload")
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor("file", {
            fileFilter(
                req: any,
                file: {
                    fieldname: string;
                    originalname: string;
                    encoding: string;
                    mimetype: string;
                    size: number;
                    destination: string;
                    filename: string;
                    path: string;
                    buffer: Buffer;
                },
                callback: (error: Error | null, acceptFile: boolean) => void
            ) {
                if (file.originalname === "set-random") {
                    // the mime-types package has a wrong audio/webm extension.
                    const extension =
                        file.mimetype !== "audio/webm"
                            ? mime.extension(file.mimetype)
                            : "webm";

                    file.originalname =
                        "random-name-" +
                        (Math.random() * 1000).toFixed() +
                        "." +
                        extension;
                }
                callback(null, true);
            },
        })
    )
    async upload(
        @Req() request,
        @Body("roomId") roomId: string,
        @Body("fileType") fileType: FileType,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 1e8 })],
            })
        )
        file: Express.Multer.File
    ) {
        const senderId = request.user.id;

        const fileInfo = await this.fileService.createRecord(
            senderId,
            roomId,
            file,
            fileType
        );
        await this.s3Service.upload(fileInfo.path, file.buffer);
        return { id: fileInfo.id };
    }

    @Delete("/waited")
    @UseGuards(AuthGuard)
    async delete(
        @Req() request,
        @Body("fileId") fileId: string,
        @Body("roomId") roomId: string
    ) {
        const userId = request.user.id;

        const fileInfo = await this.fileService.deleteWaitedFile(
            userId,
            roomId,
            fileId
        );
        await this.s3Service.delete(fileInfo.path);
    }

    @Get("by-chunks")
    async getAttachmentByChunks(
        @Req() request: Request,
        @Res() response: Response
    ) {
        const { name } = request.query;
        const mimeType = mime.lookup(name as string);
        const filePath = path.join(
            this.appConstantsService.USERS_DATA_FOLDER_PATH,
            name as string
        );
        const fileInfo = fs.statSync(filePath);
        const fileSize = fileInfo.size;
        if (
            !fileInfo.isFile() ||
            !mimeType ||
            !(mimeType.includes("video") || mimeType.includes("audio"))
        ) {
            throw new BadRequestException();
        }

        const range = request.headers.range || "0";
        const chunkSize = 1e6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, fileSize - 1);

        const contentLength = end - start + 1;

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": mimeType,
        };

        response.writeHead(206, headers);

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(response);
    }
}
