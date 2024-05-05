import { Controller, Get, Query, Res } from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import { AppConstantsService } from "../app.constants.service";
import * as https from "https";

@Controller("s3")
export class S3Controller {
    constructor(
        @InjectS3() private readonly s3: S3,
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

    @Get("/file/:fileName")
    async file(@Res() response, @Query("path") path: string) {
        try {
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
}
