import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { UserModule } from "./user/user.module";
import { MessageModule } from "./message/message.module";
import { DatabaseModule } from "./database/database.module";
import { AppConstantsService } from "./app.constants.service";
import { RoomModule } from "./room/room.module";
import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./file/file.module";
import { ParticipantModule } from "./participant/participant.module";
import { LinkPreviewModule } from "./link-preview/link-preview.module";
import { PassportModule } from "@nestjs/passport";
import { SessionModule } from "./session/session.module";
import { RoomsOnFoldersModule } from "./rooms-on-folders/rooms-on-folders.module";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        PassportModule.register({
            session: true,
            defaultStrategy: "local",
        }),
        DatabaseModule,
        AuthModule,
        UserModule,
        MessageModule,
        ChatModule,
        RoomModule,
        FileModule,
        ParticipantModule,
        LinkPreviewModule,
        SessionModule,
        RoomsOnFoldersModule,
    ],
    providers: [AppConstantsService],
    exports: [AppConstantsService],
})
export class AppModule {}
