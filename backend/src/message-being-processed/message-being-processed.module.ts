import { Module } from "@nestjs/common";
import { MessageBeingProcessedService } from "./message-being-processed.service";
import { MessageBeingProcessedController } from "./message-being-processed.controller";
import { FileModule } from "../file/file.module";

@Module({
    imports: [FileModule],
    controllers: [MessageBeingProcessedController],
    providers: [MessageBeingProcessedService],
    exports: [MessageBeingProcessedService],
})
export class MessageBeingProcessedModule {}
