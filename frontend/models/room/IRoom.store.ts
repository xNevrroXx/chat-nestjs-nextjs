import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import { SocketIOService } from "@/services/SocketIO.service";
import { ILinkPreviewInfo } from "@/models/other/ILinkPreviewInfo";
import { FetchingStatus } from "@/hooks/useFetch.hook";
import { IFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";

export enum FileType {
    VOICE_RECORD = "VOICE_RECORD",
    VIDEO_RECORD = "VIDEO_RECORD",
    ATTACHMENT = "ATTACHMENT",
}

export enum RoomType {
    GROUP = "GROUP",
    PRIVATE = "PRIVATE",
}

// Store types
export interface IRoomSlice {
    userId: TValueOf<Pick<IUserDto, "id">>;
    local: {
        rooms: {
            byId: {
                [id: TValueOf<Pick<IRoom, "id">>]: IRoom;
            };
        };
        allIds: TValueOf<Pick<IRoom, "id">>[];
    };
    previews: {
        rooms: TPreviewExistingRoom[];
        status: FetchingStatus;
    };
    socket: SocketIOService | null;
}
export interface IRoom {
    id: string;
    name: string;
    color: string;
    userId: TValueOf<Pick<IUserDto, "id">>;
    type: RoomType;
    folderIds: TValueOf<Pick<IFolder, "id">>[];
    creatorUser?: TValueOf<Pick<IUserDto, "id">>;
    days: IMessagesByDays;
    participants: IParticipant[];
    pinnedMessages: TPinnedMessage[];

    createdAt: string;
    updatedAt: string | undefined | null;
}

export interface IMessagesByDays {
    [date: string]: (IMessage | IForwardedMessage)[];
}

export interface IParticipant {
    id: string;
    color: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    userId: TValueOf<Pick<IUserDto, "id">>;
    nickname: string;
    isTyping: boolean;
    isStillMember: boolean;
}

export type TPinnedMessage = {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    text: string | undefined;
};

export interface IUserTyping {
    userId: TValueOf<Pick<IUserDto, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
    isTyping: boolean;
    updatedAt: string;
}

export interface IMessage extends IInnerMessage {
    replyToMessage: IInnerMessage | IInnerForwardedMessage | undefined | null;
}

export interface IForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: IInnerMessage | IInnerForwardedMessage;
}

export interface IInnerMessage extends IOriginalMessage {
    files: IFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<IMessage, "id">>;
}

export interface IOriginalMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    hasRead: boolean;
    links: string[];
    isDeleted: boolean;
    firstLinkInfo: ILinkPreviewInfo | undefined;
    text: string | undefined | null;

    createdAt: string;
    updatedAt: string | undefined | null;
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

// HTTP response types
export type TPreviewExistingRoom = Omit<IRoom, "createdAt" | "updatedAt"> & {
    wasMember: boolean;
};
export type TPreviewExistingRoomWithFlag = TPreviewExistingRoom & {
    isPreview: true;
};

export interface IGetStandardMessage {
    message: IMessage;
    date: keyof IMessagesByDays;
}

export interface IGetForwardedMessage {
    message: IForwardedMessage;
    date: keyof IMessagesByDays;
}

export interface IReadMessageSocket {
    message: {
        id: string;
        date: keyof IMessagesByDays;
    };
    roomId: string;
}

export interface IEditedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>;
    message: {
        id: string;
        text: string;
        date: keyof IMessagesByDays;
        updatedAt: TValueOf<Pick<IMessage, "updatedAt">>;
    };
    dependentMessages: [
        {
            id: string;
            date: keyof IMessagesByDays;
        },
    ];
}

export type TPinnedMessagesSocket = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    messages: TPinnedMessage[];
};

export interface IDeletedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>;
    message: {
        id: string;
        date: keyof IMessagesByDays;
    };
    dependentMessages: [
        {
            id: string;
            date: keyof IMessagesByDays;
        },
    ];
    isDeleted: boolean;
}

export interface IStandardMessageSocket {
    message: IMessage;
    date: keyof IMessagesByDays;
}

export interface IForwardedMessageSocket {
    message: IForwardedMessage;
    date: keyof IMessagesByDays;
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

export type TCreateGroupRoom = {
    name: TValueOf<Pick<IRoom, "name">>;
    type: RoomType.GROUP;
    memberIds: TValueOf<Pick<IUserDto, "id">>[];
};

export type TSendUserTyping = Omit<IUserTyping, "updatedAt" | "userId">;

export type TSendMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    text: TValueOf<Pick<IMessage, "text">>;
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
} & ISendAttachments;

export interface IForwardMessage {
    roomId: TValueOf<Pick<IRoom, "id">>;
    forwardedMessageId: TValueOf<Pick<IMessage, "id">>;
}

export interface ISendAttachments {
    attachments: IAttachment[];
}

export interface IAttachment {
    originalName: string;
    fileType: FileType;
    mimeType: string;
    extension: string;
    buffer: ArrayBuffer;
}

export interface IDeleteMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    isForEveryone: boolean;
}

export interface IEditMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    text: TValueOf<Pick<IOriginalMessage, "text">>;
}

export interface IPinMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
}

// check methods
export function checkIsMessage(
    obj: IMessage | IForwardedMessage,
): obj is IMessage {
    const message = obj as IMessage;
    return message.files !== undefined;
}

export function checkIsInnerMessage(
    obj: IInnerMessage | IInnerForwardedMessage,
): obj is IInnerMessage {
    const message = obj as IInnerMessage;
    return message.files !== undefined;
}

export function checkIsPreviewExistingRoomWithFlag(
    obj: IRoom | TPreviewExistingRoomWithFlag,
) {
    const room = obj as TPreviewExistingRoomWithFlag;
    return room.isPreview;
}
