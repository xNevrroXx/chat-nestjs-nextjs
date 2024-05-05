import { Global, Module } from "@nestjs/common";
import { S3Controller } from "./s3.controller";
import { S3Service } from "./s3.service";
import { FileModule } from "../file/file.module";

@Global()
@Module({
    imports: [FileModule],
    controllers: [S3Controller],
    providers: [S3Service],
    exports: [S3Service],
})
export class S3Module {}
