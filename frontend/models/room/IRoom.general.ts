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
    PIN = "PIN",
    EDIT = "EDIT",
    REPLY = "REPLY",
    DELETE = "DELETE",
    FORWARD = "FORWARD",
}

export type TMessageForAction =
    | {
          message: IInnerStandardMessage | IInnerForwardedMessage;
          action:
              | MessageAction.PIN
              | MessageAction.REPLY
              | MessageAction.FORWARD;
      }
    | {
          message: IInnerStandardMessage | IInnerForwardedMessage;
          action: MessageAction.DELETE;
          isForEveryone: boolean;
      }
    | {
          message: IInnerStandardMessage;
          action: MessageAction.EDIT;
      };

export type TMessageForActionEditOrReply =
    | {
          message: IInnerStandardMessage | IInnerForwardedMessage;
          action: MessageAction.REPLY;
      }
    | {
          message: IInnerStandardMessage;
          action: MessageAction.EDIT;
      };
