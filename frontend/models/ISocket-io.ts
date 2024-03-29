import {
    TSendMessage,
    IForwardMessage,
    TSendUserTyping,
    IParticipant,
    IPinMessage,
    IEditMessage,
    IDeleteMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket,
    IRoom,
    IReadMessageSocket,
    IMessageRead,
    IStandardMessageSocket,
    IForwardedMessageSocket,
    ILeaveRoom,
} from "@/models/room/IRoom.store";
import { TUserOnline } from "@/models/auth/IAuth.store";

export interface IServerToClientEvents {
    // user
    "user:toggle-online": (data: TUserOnline) => void;
    // room
    "room:user-left": (data: ILeaveRoom) => void;
    "room:toggle-typing": (data: IParticipant[]) => void;
    "room:add-or-update": (data: IRoom) => void;
    // message
    "message:read": (data: IReadMessageSocket) => void;
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:standard": (data: IStandardMessageSocket) => void;
    "message:forwarded": (data: IForwardedMessageSocket) => void;
}

export interface IClientToServerEvents {
    // user
    "user:toggle-typing": (data: TSendUserTyping) => void;
    // room
    "room:leave": (data: Pick<ILeaveRoom, "roomId">) => void;
    "room:join-or-create": (data: { id: string }) => void;
    // message
    "message:read": (data: IMessageRead) => void;
    "message:pin": (data: IPinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "message:standard": (data: TSendMessage) => void;
}
