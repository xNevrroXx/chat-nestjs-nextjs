import { TValueOf } from "./TUtils";
import { FileType, UserTyping } from "@prisma/client";
import { IRoom } from "../room/room.model";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IOriginalMessage,
    TPinnedMessage,
} from "../message/message.model";

export interface IMessageRead {
    messageId: string;
    roomId: string;
}

export interface ILeaveRoom {
    roomId: string;
    userId: string;
}

export interface IReadMessageSocket {
    message: {
        id: string;
        date: string;
    };
    roomId: string;
}

export interface IFile {
    id: string;
    url: string;
    originalName: string;
    fileType: FileType;
    mimeType: string;
    extension: string;
    size: { value: string; unit: string };

    createdAt: string;
}

export interface IEditedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>;
    message: {
        id: string;
        text: string;
        date: string;
        updatedAt: TValueOf<Pick<IInnerStandardMessage, "updatedAt">>;
    };
    dependentMessages: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    }[];
}

export type TPinnedMessagesSocket = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    messages: TPinnedMessage[];
};

export type TUnpinnedMessageSocket = {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
};

export interface IDeletedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>;
    message: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    };
    dependentMessages: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    }[];
    isDeleted: boolean;
}

export interface IStandardMessageSocket {
    message: IInnerStandardMessage;
    date: string;
}

export interface IForwardedMessageSocket {
    message: IInnerForwardedMessage;
    forwardedMessage: IOriginalMessage;
    date: string;
}

// only client types(without responses) to send data
export interface IMessageRead {
    messageId: string;
    roomId: string;
}

export interface ILeaveRoom {
    roomId: string;
    userId: string;
}

export type TSendUserTyping = Omit<UserTyping, "updatedAt" | "userId">;

export type TSendMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    text: TValueOf<Pick<IInnerStandardMessage, "text">>;
    replyToMessageId:
        | TValueOf<Pick<IInnerStandardMessage, "id">>
        | undefined
        | null;
} & ISendAttachments;

export interface IForwardMessage {
    roomId: TValueOf<Pick<IRoom, "id">>;
    forwardedMessageId: TValueOf<Pick<IInnerStandardMessage, "id">>;
}

export interface ISendAttachments {
    attachmentIds: string[];
}

export interface IDeleteMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    isForEveryone: boolean;
}

export interface IEditMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    text: NonNullable<TValueOf<Pick<IOriginalMessage, "text">>>;
}

export interface IPinMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
}
export interface IUnpinMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
}
