import { forwardRef, Module } from "@nestjs/common";
import { MessageBeingProcessedService } from "./message-being-processed.service";
import { MessageBeingProcessedController } from "./message-being-processed.controller";
import { RoomModule } from "../room/room.module";
import { FileProcessedMessagesModule } from "../file-processed-messages/file-processed-messages.module";

@Module({
    imports: [FileProcessedMessagesModule, forwardRef(() => RoomModule)],
    controllers: [MessageBeingProcessedController],
    providers: [MessageBeingProcessedService],
    exports: [MessageBeingProcessedService],
})
export class MessageBeingProcessedModule {}
