import { TUserDto } from "../user/IUser";
import { TValueOf } from "../models/TUtils";
import { FileType, Prisma, User } from "@prisma/client";
import { TFileToClient } from "../file/IFile";
import { IRoom } from "../room/IRooms";
import { ILinkPreviewInfo } from "../link-preview/ILinkPreview";

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>;
    rooms: IRoom[];
}

export type TMessage = IStandardMessage | IForwardedMessage;

export type TMessageWithoutFileBlobs = Prisma.MessageGetPayload<{
    include: {
        files: true;
        replyToMessage: {
            include: {
                files: true;
            };
        };
    };
}>;

export type TForwardMessageWithoutFileBlobs = Prisma.MessageGetPayload<{
    include: {
        forwardedMessage: {
            include: {
                files: true;
                replyToMessage: {
                    include: {
                        files: true;
                    };
                };
            };
            usersDeletedThisMessage: true;
        };
    };
}>;

export const OriginalMessagePrisma = {
    usersDeletedThisMessage: true,
    files: true,
};

export const ReplyMessagePrisma = {
    files: true,
    replyToMessage: {
        include: {
            files: true,
            usersDeletedThisMessage: true,
        },
    },
    usersDeletedThisMessage: true,
};

export const ForwardedMessagePrisma = {
    files: true,
    forwardedMessage: {
        include: {
            files: true,
            usersDeletedThisMessage: true,
        },
    },
    usersDeletedThisMessage: true,
};

export const FullMessageInfo = {
    ...ReplyMessagePrisma,
    ...ForwardedMessagePrisma,
};

export type TNormalizeMessageArgument =
    | Prisma.MessageGetPayload<{
          include: {
              files: true;
              forwardedMessage: {
                  include: {
                      files: true;
                      usersDeletedThisMessage: true;
                  };
              };
              usersDeletedThisMessage: true;
          };
      }>
    | Prisma.MessageGetPayload<{
          include: {
              files: true;
              replyToMessage: {
                  include: {
                      files: true;
                      usersDeletedThisMessage: true;
                  };
              };
              usersDeletedThisMessage: true;
          };
      }>;

export interface IStandardMessage extends IInnerStandardMessage {
    replyToMessage:
        | IInnerStandardMessage
        | IInnerForwardedMessage
        | undefined
        | null;
}

export interface IForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: IInnerStandardMessage | IInnerForwardedMessage;
}

export interface IInnerStandardMessage extends IOriginalMessage {
    files: TFileToClient[];
    replyToMessageId: TValueOf<Pick<IStandardMessage, "id">> | undefined | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<IStandardMessage, "id">>;
}

export interface IOriginalMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<User, "id">>;
    hasRead: boolean;
    links: string[];
    isDeleted: boolean;
    firstLinkInfo: ILinkPreviewInfo | undefined;
    text: string | undefined | null;

    createdAt: Date | string;
    updatedAt: Date | string | undefined | null;
}

export interface IFile {
    id: string;
    originalName: string;
    fileType: FileType;
    mimeType: string;
    extension: string;
    blob: Blob;

    createdAt: string;
}

export function isInnerMessage(
    obj: IInnerStandardMessage | IInnerForwardedMessage
): obj is IInnerStandardMessage {
    return !!(obj as IInnerStandardMessage).files;
}

// forwarded types check
export function isForwardedMessagePrisma(
    obj: TMessageWithoutFileBlobs | TForwardMessageWithoutFileBlobs
): obj is TForwardMessageWithoutFileBlobs {
    return (
        (obj as TForwardMessageWithoutFileBlobs).forwardedMessage &&
        (obj as TForwardMessageWithoutFileBlobs).forwardedMessage !== null
    );
}
export function isForwardedMessagePrisma2(
    obj: Prisma.MessageGetPayload<{
        include: typeof ForwardedMessagePrisma | typeof ReplyMessagePrisma;
    }>
): obj is Prisma.MessageGetPayload<{ include: typeof ForwardedMessagePrisma }> {
    return (
        (
            obj as Prisma.MessageGetPayload<{
                include: typeof ForwardedMessagePrisma;
            }>
        ).forwardedMessage &&
        (
            obj as Prisma.MessageGetPayload<{
                include: typeof ForwardedMessagePrisma;
            }>
        ).forwardedMessage !== null
    );
}

export function isForwardedMessage(
    obj: IStandardMessage | IForwardedMessage
): obj is IForwardedMessage {
    return (
        !!(obj as IForwardedMessage).forwardedMessage &&
        (obj as IForwardedMessage).forwardedMessage !== null
    );
}

export function isInnerForwardedMessage(
    obj: IInnerStandardMessage | IInnerForwardedMessage
): obj is IInnerForwardedMessage {
    return !!(obj as IInnerForwardedMessage).forwardedMessageId;
}

// reply types check
export function isReplyMessagePrisma(
    obj:
        | TNormalizeMessageArgument
        | Prisma.MessageGetPayload<{ include: typeof ReplyMessagePrisma }>
): obj is Prisma.MessageGetPayload<{ include: typeof ReplyMessagePrisma }> {
    return !!(
        obj as Prisma.MessageGetPayload<{ include: typeof ReplyMessagePrisma }>
    ).replyToMessage;
}
