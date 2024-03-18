import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { RoomModule } from "../room/room.module";
import { FileModule } from "../file/file.module";
import { MessageModule } from "../message/message.module";
import { UserModule } from "../user/user.module";
import { ParticipantModule } from "../participant/participant.module";
import { RoomsOnFoldersModule } from "../rooms-on-folders/rooms-on-folders.module";

@Module({
    imports: [
        RoomModule,
        FileModule,
        UserModule,
        MessageModule,
        ParticipantModule,
        RoomsOnFoldersModule,
    ],
    providers: [ChatGateway],
})
export class ChatModule {}
