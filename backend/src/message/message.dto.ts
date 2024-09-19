import { TValueOf } from "../models/TUtils";
import { Message, Room, File } from "@prisma/client";
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
    ValidateNested,
} from "class-validator";
import {
    MessageAction,
    TMessageForAction,
    TNewMessage,
    TRecentMessage,
} from "./message.model";

export class MessageForAction implements TMessageForAction {
    @MinLength(1)
    id: string;

    @IsEnum(MessageAction)
    action: MessageAction;
}

export class RecentMessageDto implements TRecentMessage {
    @IsString()
    @MinLength(1)
    roomId: TValueOf<Pick<Room, "id">>;

    @IsOptional()
    @IsString()
    text: TValueOf<Pick<Message, "text">>;

    @IsOptional()
    @ValidateNested()
    messageForAction: MessageForAction;
}

export class MessageDto implements TNewMessage {
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
