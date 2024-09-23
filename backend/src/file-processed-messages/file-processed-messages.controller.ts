import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import * as mime from "mime-types";
import { AuthGuard } from "../auth/auth.guard";
import { FileProcessedMessagesService } from "./file-processed-messages.service";
import { S3Service } from "../s3/s3.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileType } from "@prisma/client";

@Controller("file-processed")
export class FileProcessedMessagesController {
    constructor(
        private readonly fileProcessedMessagesService: FileProcessedMessagesService,
        private readonly s3Service: S3Service
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
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
        const userId = request.user.id as string;

        const fileInfo = await this.fileProcessedMessagesService.create(
            userId,
            roomId,
            file,
            fileType
        );
        await this.s3Service.upload(fileInfo.path, file.buffer);

        return this.fileProcessedMessagesService.normalize(fileInfo);
    }

    @Delete()
    @UseGuards(AuthGuard)
    async delete(
        @Req() request,
        @Body("fileId") fileId: string,
        @Body("roomId") roomId: string
    ) {
        const userId = request.user.id;

        const fileInfo = await this.fileProcessedMessagesService.delete(
            userId,
            roomId,
            fileId
        );
        await this.s3Service.delete(fileInfo.path);
    }
}
