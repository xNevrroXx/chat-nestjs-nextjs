import { useCallback, useEffect, useRef } from "react";
// @ts-ignore
import freeice from "freeice";
import { useAppSelector } from "@/hooks/store.hook";
import { roomParticipantsSelector } from "@/store/selectors/roomParticipants.selector";
import { useStateWithCallback } from "@/hooks/useStateWithCallback.hook";

type TPeerMediaElements = {
    [peerId: string]: HTMLMediaElement | undefined;
};
type TPeerConnections = {
    [peerId: string]: RTCPeerConnection;
};

const useWebRTC = (roomId: string) => {
    const socket = useAppSelector((state) => state.room.socket);
    const { myId, participants } = useAppSelector((state) =>
        roomParticipantsSelector(state, roomId),
    );
    const { state: clients, updateState: updateClients } = useStateWithCallback<
        string[]
    >([]);

    const addNewClient = useCallback(
        (newClient: string, cb: () => void) => {
            updateClients((list) => {
                if (!list.includes(newClient)) {
                    return [...list, newClient];
                }

                return list;
            }, cb);
        },
        [updateClients],
    );
    const peerConnections = useRef<TPeerConnections>({});
    const localMediaStream = useRef<MediaStream | null>(null);
    const peerMediaElements = useRef<TPeerMediaElements>({
        [myId]: undefined,
    });

    useEffect(() => {
        if (!socket) {
            return;
        }

        function handleNewPeer({
            peerId,
            shouldCreateOffer,
        }: {
            peerId: string;
            shouldCreateOffer: boolean;
        }) {
            if (peerId in peerConnections.current) {
                return console.warn(`Already connected to peer: ${peerId}`);
            }

            peerConnections.current[peerId] = new RTCPeerConnection({
                iceServers: freeice() as unknown as RTCIceServer[],
            });

            peerConnections.current[peerId].onicecandidate = async (event) => {
                if (!socket || !localMediaStream.current) {
                    return;
                }

                if (event.candidate) {
                    socket?.emit("webrtc:relay-ice", [
                        {
                            peerId,
                            iceCandidate: event.candidate,
                        },
                    ]);
                }

                let tracksNumber = 0;
                peerConnections.current[peerId].ontrack = ({
                    streams: [remoteStream],
                }) => {
                    tracksNumber++;

                    if (tracksNumber === 2) {
                        // video & audio tracks received
                        tracksNumber = 0;
                        if (peerMediaElements.current[peerId]) {
                            peerMediaElements.current[peerId]!.srcObject =
                                remoteStream;
                        }
                        else {
                            // FIX LONG RENDER IN CASE OF MANY CLIENTS
                            let settled = false;
                            const interval = setInterval(() => {
                                if (peerMediaElements.current[peerId]) {
                                    peerMediaElements.current[
                                        peerId
                                    ]!.srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 1000);
                        }
                    }
                };

                if (!localMediaStream.current) {
                    return;
                }
                localMediaStream.current.getTracks().forEach((track) => {
                    peerConnections.current[peerId].addTrack(
                        track,
                        localMediaStream.current!,
                    );
                });

                if (shouldCreateOffer) {
                    const offer =
                        await peerConnections.current[peerId].createOffer();

                    await peerConnections.current[peerId].setLocalDescription(
                        offer,
                    );

                    socket.emit("webrtc:relay-sdp", [
                        {
                            peerId,
                            sessionDescription: offer,
                        },
                    ]);
                }
            };
        }

        socket.on("webrtc:add-peer", handleNewPeer);

        return () => {
            socket.socket.off("webrtc:add-peer");
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        const handleRemovePeer = ({ peerId }: { peerId: string }) => {
            if (peerConnections.current[peerId]) {
                peerConnections.current[peerId].close();
            }

            delete peerConnections.current[peerId];
            delete peerMediaElements.current[peerId];
        };

        socket.on("webrtc:remove-peer", handleRemovePeer);

        return () => {
            socket.socket.off("webrtc:remove-peer");
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        async function setRemoteMedia({
            peerId,
            sessionDescription: remoteDescription,
        }: {
            peerId: string;
            sessionDescription: RTCSessionDescription;
        }) {
            if (!socket) {
                return;
            }

            await peerConnections.current[peerId]?.setRemoteDescription(
                new RTCSessionDescription(remoteDescription),
            );

            if (remoteDescription.type === "offer") {
                const answer =
                    await peerConnections.current[peerId].createAnswer();

                await peerConnections.current[peerId].setLocalDescription(
                    answer,
                );

                socket.emit("webrtc:relay-sdp", [
                    {
                        peerId,
                        sessionDescription: answer,
                    },
                ]);
            }
        }

        socket.on("webrtc:session-description", setRemoteMedia);

        return () => {
            socket.socket.off("webrtc:session-description");
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        async function startCapture() {
            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
            const localMediaElement = peerMediaElements.current[myId];
            if (!localMediaElement) {
                return;
            }
            localMediaElement.volume = 0;
            localMediaElement.srcObject = localMediaStream.current;
        }

        startCapture()
            .then(() => {
                socket.emit("webrtc:init-call", [{ roomId }]);
            })
            .catch((error) => {
                console.log("error: ", error);
            });

        return () => {
            localMediaStream.current
                ?.getTracks()
                .forEach((track) => track.stop());
            socket.emit("webrtc:leave", []);
        };
    }, [myId, roomId, socket]);

    const provideMediaRef = useCallback(
        (id: string, node: HTMLVideoElement) => {
            peerMediaElements.current[id] = node;
        },
        [],
    );

    return { myId, clients, provideMediaRef };
};

export { useWebRTC };
