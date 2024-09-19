import { Global, Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { RoomModule } from "../room/room.module";
import { FileModule } from "../file/file.module";
import { MessageModule } from "../message/message.module";
import { UserModule } from "../user/user.module";
import { ParticipantModule } from "../participant/participant.module";
import { RoomsOnFoldersModule } from "../rooms-on-folders/rooms-on-folders.module";
import { MessageBeingProcessedModule } from "../message-being-processed/message-being-processed.module";

@Global()
@Module({
    imports: [
        RoomModule,
        FileModule,
        UserModule,
        MessageModule,
        ParticipantModule,
        RoomsOnFoldersModule,
        MessageBeingProcessedModule,
    ],
    providers: [ChatGateway],
    exports: [ChatGateway],
})
export class ChatModule {}
