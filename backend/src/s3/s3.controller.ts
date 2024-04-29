import {
    Controller,
    Delete,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import { AppConstantsService } from "../app.constants.service";
import * as https from "https";
import { FileInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("s3")
export class S3Controller {
    constructor(
        @InjectS3() private readonly s3: S3,
        private readonly s3Service: S3Service,
        private readonly appConstantsService: AppConstantsService
    ) {}

    @Get("buckets")
    async listBuckets() {
        try {
            const list = await this.s3.listBuckets();
            return list.Buckets;
        } catch (error) {
            console.log(error);
        }
    }

    @Get("/files")
    async files() {
        try {
            return await this.s3.listObjects({
                Bucket: this.appConstantsService.VK_BUCKET_NAME,
            });
        } catch (error) {
            console.log(error);
        }
    }

    @Post("/upload")
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 1e8 })],
            })
        )
        file: Express.Multer.File
    ) {
        await this.s3Service.upload(file.originalname, file.buffer);
    }

    @Get("/file/:fileName")
    async file(@Res() response, @Query("path") path: string) {
        try {
            console.log("path: ", path);
            https.get(
                this.appConstantsService.VK_STORAGE_URL + path,
                (proxy_pass) => {
                    proxy_pass.pipe(response);
                }
            );
        } catch (error) {
            console.log(error);
        }
    }

    @Delete("/file")
    @UseGuards(AuthGuard)
    async delete(@Query("path") path: string) {
        try {
            await this.s3.deleteObject({
                Bucket: this.appConstantsService.VK_BUCKET_NAME,
                Key: path,
            });
        } catch (error) {
            console.log("error: ", error);
        }
    }
}
