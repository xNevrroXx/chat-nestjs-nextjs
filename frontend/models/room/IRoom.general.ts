import {IFile, IForwardedMessage, IMessage} from "@/models/room/IRoom.store";

export interface ILastMessageInfo {
    sender: string,
    text: string,
    hasRead: boolean
}

// export interface IFileForRender extends IFile {
//     blobUrl: string
// }

export type TAttachmentType = "video" | "audio" | "image" | "unknown";

export interface IKnownAndUnknownFiles {
    known: ( IFile & {attachmentType: Exclude<TAttachmentType, "unknown">} )[],
    unknown: ( IFile & {attachmentType: Extract<TAttachmentType, "unknown">} )[]
}

export enum MessageAction {
    PIN = "PIN",
    EDIT = "EDIT",
    REPLY = "REPLY",
    DELETE = "DELETE",
    FORWARD = "FORWARD"
}

export type TMessageForAction =
    {
        message: IMessage | IForwardedMessage,
        action: MessageAction.PIN | MessageAction.REPLY | MessageAction.FORWARD
    }
    |
    {
        message: IMessage | IForwardedMessage,
        action: MessageAction.DELETE,
        isForEveryone: boolean
    }
    |
    {
        message: IMessage,
        action: MessageAction.EDIT
    };
