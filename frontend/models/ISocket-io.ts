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
    IMessageRead,
} from "@/models/room/IRoom.store";
import { TUserOnline } from "@/models/auth/IAuth.store";

export interface IServerToClientEvents {
    // user
    "user:toggle-online": (data: TUserOnline) => void;
    // room
    "room:toggle-typing": (data: IParticipant[]) => void;
    "room:add-or-update": (data: IRoom) => void;
    // message
    "message:read": (data: IMessageRead) => void;
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:standard": (data: IMessage) => void;
    "message:forwarded": (data: IForwardedMessage) => void;
    // WebRTC
    "webrtc:init-call": () => void;
    "webrtc:leave": () => void;
    "webrtc:add-peer": ({
        peerId,
        shouldCreateOffer,
    }: {
        peerId: string;
        shouldCreateOffer: boolean;
    }) => void;
    "webrtc:remove-peer": ({ peerId }: { peerId: string }) => void;
    "webrtc:relay-sdp": () => void;
    "webrtc:relay-ice": () => void;
    "webrtc:ice-candidate": () => void;
    "webrtc:session-description": ({
        peerId,
        sessionDescription,
    }: {
        peerId: string;
        sessionDescription: RTCSessionDescription;
    }) => void;
}

export interface IClientToServerEvents {
    // user
    "user:toggle-typing": (data: TSendUserTyping) => void;
    // room
    "room:join-or-create": (data: { id: string }) => void;
    // message
    "message:read": (data: IMessageRead) => void;
    "message:pin": (data: IPinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "message:standard": (data: TSendMessage) => void;
    // WebRTC
    "webrtc:init-call": ({ roomId }: { roomId: string }) => void;
    "webrtc:leave": ({ roomId }: { roomId: string }) => void;
    "webrtc:add-peer": () => void;
    "webrtc:remove-peer": () => void;
    "webrtc:relay-sdp": ({
        peerId,
        sessionDescription,
    }: {
        peerId: string;
        sessionDescription: RTCSessionDescriptionInit;
    }) => void;
    "webrtc:relay-ice": ({
        peerId,
        iceCandidate,
    }: {
        peerId: string;
        iceCandidate: RTCIceCandidate;
    }) => void;
    "webrtc:ice-candidate": () => void;
}
