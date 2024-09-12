import {
    IFile,
    IInnerForwardedMessage,
    IInnerStandardMessage,
} from "@/models/room/IRoom.store";

export interface ILastMessageInfo {
    sender: string;
    text: string;
    hasRead: boolean;
}

// export interface IFileForRender extends IFile {
//     blobUrl: string
// }

export type TAttachmentType = "video" | "audio" | "image" | "unknown";

export interface IKnownAndUnknownFiles {
    known: (IFile & { attachmentType: Exclude<TAttachmentType, "unknown"> })[];
    unknown: (IFile & {
        attachmentType: Extract<TAttachmentType, "unknown">;
    })[];
}

export enum MessageAction {
    EDIT = "EDIT",
    REPLY = "REPLY",
}

export type TMessageForEditOrReply =
    | {
          message: IInnerStandardMessage | IInnerForwardedMessage;
          action: MessageAction.REPLY;
      }
    | {
          message: IInnerStandardMessage;
          action: MessageAction.EDIT;
      };
