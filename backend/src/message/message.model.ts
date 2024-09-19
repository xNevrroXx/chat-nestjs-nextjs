import { TValueOf } from "../models/TUtils";
import {
    FileType,
    Message,
    MessageBeingProcessed,
    Prisma,
    Room,
    User,
} from "@prisma/client";
import { TFileToClient } from "../file/file.model";
import { IRoom } from "../room/room.model";
import { ILinkPreviewInfo } from "../link-preview/link-preview.model";
import { IGetAttachments } from "../chat/chat.model";

export type TMessage = IInnerStandardMessage | IInnerForwardedMessage;

export type TNewMessage = {
    roomId: TValueOf<Pick<Room, "id">>;
    text: TValueOf<Pick<Message, "text">>;
    replyToMessageId: TValueOf<Pick<Message, "id">> | null;
} & IGetAttachments;

export type TRecentMessage = Pick<MessageBeingProcessed, "roomId" | "text"> & {
    messageForAction?: TMessageForAction;
};

export type TMessageForAction = {
    action: MessageAction;
    id: string;
};

export enum MessageAction {
    EDIT = "EDIT",
    REPLY = "REPLY",
}

export interface IRecentMessageInput {
    text: TValueOf<Pick<MessageBeingProcessed, "text">>;
    files: TFileToClient[];
}

export const ReplyMessagePrisma = {
    files: true,
    replyToMessage: {
        include: {
            files: true,
            userDeletedThisMessage: true,
        },
    },
    userDeletedThisMessage: true,
};

export const ForwardedMessagePrisma = {
    files: true,
    forwardedMessage: {
        include: {
            files: true,
            userDeletedThisMessage: true,
        },
    },
    userDeletedThisMessage: true,
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
                      userDeletedThisMessage: true;
                  };
              };
              replyToMessage: {
                  include: {
                      files: true;
                      userDeletedThisMessage: true;
                  };
              };
              userDeletedThisMessage: true;
          };
      }>
    | Prisma.MessageGetPayload<{
          include: {
              files: true;
              replyToMessage: {
                  include: {
                      files: true;
                      userDeletedThisMessage: true;
                  };
              };
              userDeletedThisMessage: true;
          };
      }>
    | Prisma.MessageGetPayload<{
          include: {
              files: true;
              forwardedMessage: {
                  include: {
                      files: true;
                      userDeletedThisMessage: true;
                  };
              };
              userDeletedThisMessage: true;
          };
      }>
    | Prisma.MessageGetPayload<{
          include: {
              files: true;
              userDeletedThisMessage: true;
          };
      }>;

export interface IInnerStandardMessage extends IOriginalMessage {
    files: TFileToClient[];
    replyToMessage:
        | {
              id: TValueOf<Pick<IOriginalMessage, "id">>;
              date: string;
          }
        | undefined
        | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessage:
        | {
              id: TValueOf<Pick<IOriginalMessage, "id">>;
              date: string;
          }
        | undefined
        | null;
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

export type TPinnedMessagesByRoom = {
    roomId: TValueOf<Pick<Room, "id">>;
    messages: TPinnedMessage[];
};
export type TPinnedMessage = {
    pinDate: string;
    message: {
        id: TValueOf<Pick<Message, "id">>;
        date: string;
    };
};

export interface IFile {
    id: string;
    originalName: string;
    fileType: FileType;
    mimeType: string;
    extension: string;
    blob: Blob;

    createdAt: string;
}

// forwarded types check
export function isForwardedMessagePrisma(
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

export function isInnerForwardedMessage(
    obj: IInnerStandardMessage | IInnerForwardedMessage
): obj is IInnerForwardedMessage {
    return !!(obj as IInnerForwardedMessage).forwardedMessage;
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
