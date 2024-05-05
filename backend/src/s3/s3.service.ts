import { Injectable } from "@nestjs/common";
import { InjectS3, S3 } from "nestjs-s3";
import { AppConstantsService } from "../app.constants.service";
import { PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
    constructor(
        @InjectS3() private readonly s3: S3,
        private readonly appConstantsService: AppConstantsService
    ) {}

    generateFilePath({
        senderId,
        originalName,
    }: {
        senderId: string;
        originalName: string;
    }): string {
        const timestamp = new Date().toISOString();
        return senderId + "/" + timestamp + "/" + originalName;
    }

    async upload(key: string, buffer: Buffer) {
        return this.s3.send(
            new PutObjectCommand({
                Bucket: this.appConstantsService.VK_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ACL: "public-read",
            })
        );
    }

    async delete(key: string) {
        return this.s3.deleteObject({
            Bucket: this.appConstantsService.VK_BUCKET_NAME,
            Key: key,
        });
    }
}
