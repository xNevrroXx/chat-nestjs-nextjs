import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { AuthModule } from "../auth/auth.module";
import { FileModule } from "../file/file.module";
import { UserModule } from "../user/user.module";
import { LinkPreviewModule } from "../link-preview/link-preview.module";
import { MessageController } from "./message.controller";
import { ParticipantModule } from "../participant/participant.module";

@Module({
    imports: [
        AuthModule,
        FileModule,
        UserModule,
        LinkPreviewModule,
        ParticipantModule,
    ],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService],
})
export class MessageModule {}
