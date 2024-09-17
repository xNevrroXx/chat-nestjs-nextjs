import { forwardRef, Module } from "@nestjs/common";
import { ParticipantService } from "./participant.service";
import { ParticipantController } from "./participant.controller";
import { ChatModule } from "../chat/chat.module";
import { RoomModule } from "../room/room.module";

@Module({
    imports: [forwardRef(() => RoomModule), forwardRef(() => ChatModule)],
    providers: [ParticipantService],
    exports: [ParticipantService],
    controllers: [ParticipantController],
})
export class ParticipantModule {}
