import {
    TSendMessage,
    IForwardMessage,
    TSendUserTyping,
    TParticipant,
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
    TUnpinnedMessageSocket,
    IUnpinMessage,
} from "@/models/room/IRoom.store";
import { TUserOnline } from "@/models/auth/IAuth.store";

export interface IServerToClientEvents {
    // user
    "user:toggle-online": (data: TUserOnline) => void;
    // room
    "room:user-left": (data: ILeaveRoom) => void;
    "room:toggle-typing": (data: TParticipant[]) => void;
    "room:add-or-update": (data: IRoom) => void;
    // message
    "message:read": (data: IReadMessageSocket) => void;
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:unpinned": (data: TUnpinnedMessageSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:standard": (data: IStandardMessageSocket) => void;
    "message:forwarded": (data: IForwardedMessageSocket) => void;
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
    "webrtc:ice-candidate": ({
        peerID,
        iceCandidate,
    }: {
        peerID: string;
        iceCandidate: RTCIceCandidateInit;
    }) => void;
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
    "room:leave": (data: Pick<ILeaveRoom, "roomId">) => void;
    "room:join-or-create": (data: { id: string }) => void;
    // message
    "message:read": (data: IMessageRead) => void;
    "message:pin": (data: IPinMessage) => void;
    "message:unpin": (data: IUnpinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "message:standard": (data: TSendMessage) => void;
    // WebRTC
    "webrtc:join": ({ roomId }: { roomId: string }) => void;
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
