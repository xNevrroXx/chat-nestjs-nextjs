import { Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import { AppConstantsService } from "../app.constants.service";
import { Response, Request } from "express";
import { Readable } from "stream";
import { PipelinePromise } from "stream";
import { pipeline } from "stream/promises";
import { S3Service } from "./s3.service";

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

    // @Get("/file/:fileName")
    // async file(@Res() response: Response, @Query("path") path: string) {
    //     try {
    // https.get(
    //     this.appConstantsService.VK_STORAGE_URL + path,
    //     (proxy_pass) => {
    //         proxy_pass.pipe(response);
    //     }
    // );
    // const fullPath = path + "/" + fileName;
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    @Get("/file/:fileName")
    async fileStream(
        @Req() request: Request,
        @Res() response: Response,
        @Param("fileName") fileName: string,
        @Query("path") path: string
    ) {
        try {
            // const Key = path;
            // const videoSize = await this.s3Service.getFileSize(Key);
            // const CHUNK_SIZE = 1000;
            //
            // const requestedRange = request.headers.range || "";
            // const start = Number(requestedRange.replace(/\\\\D/g, ""));
            // const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
            // const contentLength = end - start + 1;
            //
            // response.statusCode = 206;
            // response.setHeader("Accept-Ranges", "bytes");
            // response.setHeader(
            //     "Content-Range",
            //     `bytes ${start}-${end}/${videoSize}`
            // );
            // response.setHeader("Content-Length", contentLength);
            //
            const result = await this.s3.getObject({
                Bucket: this.appConstantsService.VK_BUCKET_NAME,
                Key: path,
                // Range: request.headers.range || "0",
            });

            const readStream = result.Body as Readable;

            const fileSize = result.ContentLength;
            const range = request.headers.range || "0";
            const chunkSize = 1e9;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + chunkSize, fileSize - 1);

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": result.AcceptRanges,
                "Content-Length": result.ContentLength,
                "Content-Type": result.ContentType,
                ETag: result.ETag,
            };

            // response.writeHead(206, headers);

            readStream.pipe(response);
        } catch (error) {
            console.log(error);
        }
    }
}
