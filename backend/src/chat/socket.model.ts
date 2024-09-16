import { UserOnline } from "@prisma/client";
import {
    TSendMessage,
    IForwardMessage,
    TSendUserTyping,
    IPinMessage,
    IEditMessage,
    IDeleteMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket,
    IReadMessageSocket,
    IMessageRead,
    IStandardMessageSocket,
    IForwardedMessageSocket,
    ILeaveRoom,
    TUnpinnedMessageSocket,
    IUnpinMessage,
} from "../models/shared.model";
import { IRoom } from "../room/room.model";
import { TNormalizedParticipant } from "../participant/participant.model";
import { Socket } from "socket.io";
import { IUserSessionPayload } from "../user/user.model";

export type TSocketWithPayload = Socket & {
    user: IUserSessionPayload;
};

export interface IServerToClientEvents {
    // user
    "user:toggle-online": (data: UserOnline) => void;
    // room
    "room:user-left": (data: ILeaveRoom) => void;
    "room:toggle-typing": (data: TNormalizedParticipant[]) => void;
    "room:add-or-update": (data: IRoom) => void;
    "room:delete": (data: Pick<IRoom, "id">) => void;
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
    "webrtc:relay-ice": ({
        peerID,
        iceCandidate,
    }: {
        peerID: string;
        iceCandidate: RTCIceCandidateInit;
    }) => void;
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
