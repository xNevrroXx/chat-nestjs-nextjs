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
import {
    ILiveCommunicationInvitation,
    ILiveCommunicationInvite, ILiveCommunicationLeft,
    ILiveCommunicationReceiveData,
    ILiveCommunicationRespondToInvitation, ILiveCommunicationResponseToInvitation, ILiveCommunicationTransferData
} from "@/models/room/IRoom.socket";

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
    // live-communication
    "live-communication:invitation": (data: ILiveCommunicationInvitation) => void; // an invitation from another user to join a call/video-call
    "live-communication:response-to-invitation": (data: ILiveCommunicationResponseToInvitation) => void; // a response to my invitation
    "live-communication:receive-data": (data: ILiveCommunicationReceiveData) => void; // receiving data during a communication
    "live-communication:left": (data: ILiveCommunicationLeft) => void; // someone stops communicating

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
    // live-communications
    "live-communication:invite": (data: ILiveCommunicationInvite) => void; // invite someone to join a call/video-call
    "live-communication:respond-to-invitation": (data: ILiveCommunicationRespondToInvitation) => void; // my response to the invitation
    "live-communication:transfer-data": (data: ILiveCommunicationTransferData) => void; // sending data during a communication
    "live-communication:leave": () => void; // stop communicating

}
