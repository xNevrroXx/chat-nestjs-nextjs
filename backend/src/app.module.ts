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
import { S3Module } from "./s3/s3.module";
import { S3Module as S3ModulePackage } from "nestjs-s3";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env.development",
        }),
        PassportModule.register({
            session: true,
            defaultStrategy: "local",
        }),
        S3ModulePackage.forRoot({
            config: {
                credentials: {
                    accessKeyId: process.env.VK_STORAGE_ACCESS_KEY,
                    secretAccessKey: process.env.VK_STORAGE_SECRET_KEY,
                },
                endpoint: process.env.VK_STORAGE_ENDPOINT,
                region: process.env.VK_STORAGE_REGION,
                forcePathStyle: true,
            },
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
        S3Module,
    ],
    providers: [AppConstantsService],
    exports: [AppConstantsService],
})
export class AppModule {}
