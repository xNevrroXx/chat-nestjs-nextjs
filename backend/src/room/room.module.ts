import { forwardRef, Module } from "@nestjs/common";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { AuthModule } from "../auth/auth.module";
import { MessageModule } from "../message/message.module";
import { ParticipantModule } from "../participant/participant.module";
import { LinkPreviewModule } from "../link-preview/link-preview.module";
import { FileModule } from "../file/file.module";
import { UserModule } from "../user/user.module";
import { ChatModule } from "../chat/chat.module";
import { MessageBeingProcessedModule } from "../message-being-processed/message-being-processed.module";

@Module({
    imports: [
        AuthModule,
        FileModule,
        MessageModule,
        ParticipantModule,
        LinkPreviewModule,
        MessageBeingProcessedModule,
        forwardRef(() => ChatModule),
        forwardRef(() => UserModule),
    ],
    controllers: [RoomController],
    providers: [RoomService],
    exports: [RoomService],
})
export class RoomModule {}
