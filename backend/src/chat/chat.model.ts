import { TUserDto } from "../user/user.model";
import { TValueOf } from "../models/TUtils";
import { Message, File, UserTyping, Room, PinnedMessage } from "@prisma/client";

export type TNewForwardedMessage = {
    roomId: TValueOf<Pick<Room, "id">>;
    forwardedMessageId: TValueOf<Pick<Message, "id">>;
};

export type TNewEditedMessage = {
    messageId: TValueOf<Pick<Message, "id">>;
    text: TValueOf<Pick<Message, "text">>;
};

export type TDeleteMessage = {
    messageId: TValueOf<Pick<Message, "id">>;
    isForEveryone: boolean;
};

export type TPinMessage = {
    messageId: TValueOf<Pick<Message, "id">>;
};
export type TUnpinMessage = {
    messageId: TValueOf<Pick<PinnedMessage, "messageId">>;
};
export type TUnpinnedMessage = {
    roomId: TValueOf<Pick<Room, "id">>;
    messageId: TValueOf<Pick<Message, "id">>;
};

export type TReadMessage = {
    messageId: TValueOf<Pick<Message, "id">>;
};

export interface IGetAttachments {
    attachmentIds: string[];
}

export interface IAttachment
    extends Omit<File, "id" | "messageId" | "createdAt" | "fileName"> {
    buffer: ArrayBuffer;
}

export type TToggleUserTyping = Pick<
    UserTyping,
    "userId" | "roomId" | "isTyping"
>;

export interface IUserIdToSocketId {
    [userId: string]: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function exhaustiveCheck(data: never): never {
    throw new Error("Didn't expect to get here");
}
