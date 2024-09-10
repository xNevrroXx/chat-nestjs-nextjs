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
    queryString: string;
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
    forwardedMessages: {
        byId: {
            [id: TValueOf<Pick<IOriginalMessage, "id">>]: IOriginalMessage;
            // | (Pick<IOriginalMessage, "id" | "roomId"> & { date: string });
        };
        allIds: TValueOf<Pick<IOriginalMessage, "id">>[];
    };
    socket: SocketIOService | null;
}
export interface IQueryString {
    queryString: string;
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
    participants: TParticipant[];
    pinnedMessages: TPinnedMessage[];

    createdAt: string;
    updatedAt: string | undefined | null;
}

export interface IMessageBriefInfo {
    id: TValueOf<Pick<IOriginalMessage, "id">>;
    date: string;
}

export interface IMessagesByDays {
    [date: string]: (IInnerStandardMessage | IInnerForwardedMessage)[];
}

export type TParticipant = Pick<IUserDto, "color" | "displayName"> &
    Omit<IUserTyping, "updatedAt"> & {
        id: string;
        isStillMember: boolean;
    };

export type TPinnedMessage = {
    pinDate: string;
    message: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    };
};

export interface IUserTyping {
    userId: TValueOf<Pick<IUserDto, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
    isTyping: boolean;
    updatedAt: string;
}

export interface IInnerStandardMessage extends IOriginalMessage {
    files: IFile[];
    replyToMessage: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    } | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessage: {
        id: TValueOf<Pick<IOriginalMessage, "id">>;
        date: string;
    };
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
export type TRoomWithPreviewFlag = IRoom & {
    isPreview: false;
};
export type TPreviewRoomWithFlag = TPreviewExistingRoom & {
    isPreview: true;
};

export interface IGetStandardMessage {
    message: IInnerStandardMessage;
    date: keyof IMessagesByDays;
}

export interface IGetForwardedMessage {
    message: IInnerForwardedMessage;
    forwardedMessage: IOriginalMessage;
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
        updatedAt: TValueOf<Pick<IInnerStandardMessage, "updatedAt">>;
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
export type TUnpinnedMessageSocket = {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
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
    message: IInnerStandardMessage;
    date: keyof IMessagesByDays;
}

export interface IForwardedMessageSocket {
    message: IInnerForwardedMessage;
    forwardedMessage: IOriginalMessage;
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

export type TJoinRoom = Pick<TPreviewExistingRoom, "id" | "type" | "wasMember">;

export type TCreateGroupRoom = {
    name: TValueOf<Pick<IRoom, "name">>;
    type: RoomType.GROUP;
    memberIds: TValueOf<Pick<IUserDto, "id">>[];
};

export type TSendUserTyping = Omit<IUserTyping, "updatedAt" | "userId">;

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
    text: NonNullable<TValueOf<Pick<IOriginalMessage, "text">>>;
}

export interface IPinMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
}
export interface IUnpinMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>;
}

// check methods
export function checkIsOriginalMessage(
    obj: IOriginalMessage | IInnerStandardMessage | IInnerForwardedMessage,
): obj is IOriginalMessage {
    const message = obj;
    return (
        (message as IInnerStandardMessage).files == undefined &&
        (message as IInnerForwardedMessage).forwardedMessage == undefined
    );
}

export function checkIsStandardMessage(
    obj: IInnerStandardMessage | IInnerForwardedMessage | IOriginalMessage,
): obj is IInnerStandardMessage {
    const message = obj as IInnerStandardMessage;
    return message.files !== undefined;
}
