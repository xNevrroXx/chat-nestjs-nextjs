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
    TPinnedMessagesSocket,
    IRoom,
} from "@/models/room/IRoom.store";
import { TUserOnline } from "@/models/auth/IAuth.store";

export interface IServerToClientEvents {
    // user
    "user:toggle-online": (data: TUserOnline) => void;
    // room
    "room:toggle-typing": (data: IParticipant[]) => void;
    "room:add-or-update": (data: IRoom) => void;
    // message
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:standard": (data: IMessage) => void;
    "message:forwarded": (data: IForwardedMessage) => void;
}

export interface IClientToServerEvents {
    // user
    "user:toggle-typing": (data: TSendUserTyping) => void;
    // room
    "room:join-or-create": (data: { id: string }) => void;
    // message
    "message:pin": (data: IPinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "message:standard": (data: TSendMessage) => void;
}
