export interface IInitCall {
    roomId: string;
}

export interface ILeaveCall {
    roomId: string;
}

export interface IAddPeer {
    peerId: string;
    shouldCreateOffer: boolean;
}

export interface IRemovePeer {
    peerId: string;
}

export interface ISessionDescription {
    peerId: string;
    sessionDescription: RTCSessionDescription;
}

export interface IRelaySdp {
    peerId: string;
    sessionDescription: RTCSessionDescription;
}

export interface IRelayIce {
    peerId: string;
    iceCandidate: RTCIceCandidate;
}
