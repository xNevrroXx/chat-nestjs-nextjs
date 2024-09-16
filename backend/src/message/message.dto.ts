import { TMessage } from "../chat/chat.model";
import { TValueOf } from "../models/TUtils";
import { Message, Room, File } from "@prisma/client";
import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class MessageDto implements TMessage {
    @IsString()
    @MinLength(1)
    roomId: TValueOf<Pick<Room, "id">>;

    @IsArray()
    @MinLength(1, {
        each: true,
    })
    attachmentIds: TValueOf<Pick<File, "id">>[];

    @IsOptional()
    @IsString()
    text: TValueOf<Pick<Message, "text">>;

    @IsOptional()
    @IsString()
    replyToMessageId: TValueOf<Pick<Message, "id">> | null;
}
