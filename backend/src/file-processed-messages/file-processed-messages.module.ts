import { Module } from "@nestjs/common";
import { FileProcessedMessagesController } from "./file-processed-messages.controller";
import { FileProcessedMessagesService } from "./file-processed-messages.service";

@Module({
    controllers: [FileProcessedMessagesController],
    providers: [FileProcessedMessagesService],
    exports: [FileProcessedMessagesService],
})
export class FileProcessedMessagesModule {}
