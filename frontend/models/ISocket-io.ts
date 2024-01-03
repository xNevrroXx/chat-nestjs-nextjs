import {
    TSendMessage,
    IMessage,
    IForwardMessage,
    IForwardedMessage,
    TSendUserTyping,
    IParticipant,
    IPinMessage,
    IEditMessage,
    IDeleteMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket
} from "@/models/room/IRoom.store";
import {TUserOnline} from "@/models/auth/IAuth.store";

export interface ServerToClientEvents {
    // user
    "user:toggle-online": (data: TUserOnline) => void;
    // room
    "room:toggle-typing": (data: IParticipant[]) => void;
    // message
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:standard": (data: IMessage) => void;
    "message:forwarded": (data: IForwardedMessage) => void;

}

export interface ClientToServerEvents {
    // user
    "user:toggle-typing": (data: TSendUserTyping) => void;
    // message
    "message:pin": (data: IPinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "message:standard": (data: TSendMessage) => void;
}
