import { forwardRef, Module } from "@nestjs/common";
import { MessageBeingProcessedService } from "./message-being-processed.service";
import { MessageBeingProcessedController } from "./message-being-processed.controller";
import { FileModule } from "../file/file.module";
import { RoomModule } from "../room/room.module";

@Module({
    imports: [FileModule, forwardRef(() => RoomModule)],
    controllers: [MessageBeingProcessedController],
    providers: [MessageBeingProcessedService],
    exports: [MessageBeingProcessedService],
})
export class MessageBeingProcessedModule {}
