import { useCallback, useEffect, useRef } from "react";
// @ts-ignore
import { useAppSelector } from "@/hooks/store.hook";
import { roomParticipantsSelector } from "@/store/selectors/roomParticipants.selector";
import { useStateWithCallback } from "@/hooks/useStateWithCallback.hook";
import publicStunList from "@/const/public-stun-list.json";

type TPeerMediaElements = {
    [peerId: string]: HTMLMediaElement | undefined;
};
type TPeerConnections = {
    [peerId: string]: RTCPeerConnection;
};

const useWebRTC = (roomId: string) => {
    const onceRefStage1 = useRef<boolean>(false);
    const socket = useAppSelector((state) => state.room.socket);
    const { myId, participants } = useAppSelector((state) =>
        roomParticipantsSelector(state, roomId),
    );
    const { state: clients, updateState: updateClients } = useStateWithCallback<
        string[]
    >([]);

    const addNewClient = useCallback(
        (newClient: string, cb: () => void) => {
            if (!clients.includes(newClient)) {
                updateClients((list) => [...list, newClient], cb);
            }
        },
        [clients, updateClients],
    );
    const peerConnections = useRef<TPeerConnections>({});
    const localMediaStream = useRef<MediaStream | null>(null);
    const peerMediaElements = useRef<TPeerMediaElements>({});

    useEffect(() => {
        console.log("clients: ", clients);
    }, [clients]);

    // 1 stage
    useEffect(() => {
        if (!socket) {
            return;
        }
        if (onceRefStage1.current) {
            return;
        }
        onceRefStage1.current = true;

        console.log("stage 1: capture");
        async function startCapture() {
            try {
                const myMedia = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });

                localMediaStream.current = myMedia;
            }
            catch (error) {
                console.log("error get mine user media: ", error);
            }

            addNewClient(myId, () => {
                const localVideoElement = peerMediaElements.current[myId];

                if (localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
        }

        startCapture()
            .then(() => {
                socket.emit("webrtc:join", [{ roomId }]);
            })
            .catch((error) => {
                console.log("error: ", error);
            });

        return () => {
            localMediaStream.current
                ?.getTracks()
                .forEach((track) => track.stop());
            socket.emit("webrtc:leave", [{ roomId }]);
        };
    }, [addNewClient, myId, roomId, socket]);

    // Stage 2: add peer
    useEffect(() => {
        if (!socket) {
            return;
        }

        async function handleNewPeer({
            peerId,
            shouldCreateOffer,
        }: {
            peerId: string;
            shouldCreateOffer: boolean;
        }) {
            if (!socket) {
                return;
            }

            console.log("stage 2: new peer", {
                peerId,
                shouldCreateOffer,
            });
            if (peerId in peerConnections.current) {
                return console.warn(`Already connected to peer: ${peerId}`);
            }

            const configuration: RTCConfiguration = {
                // @ts-ignore
                iceServers: [{ urls: publicStunList["stun-list"] as string[] }],
            };
            peerConnections.current[peerId] = new RTCPeerConnection(
                configuration,
            );
            console.log(
                "peerConnections.current[" + peerId + "]:",
                peerConnections.current[peerId],
            );

            peerConnections.current[peerId].onicecandidate = (event) => {
                console.log("on ice candidate: ", event);
                if (!socket) {
                    return;
                }

                if (event.candidate) {
                    // сигнализируем, что мы хотим подключиться
                    socket.emit("webrtc:relay-ice", [
                        {
                            peerId,
                            iceCandidate: event.candidate,
                        },
                    ]);
                }
            };

            let tracksNumber = 0;
            peerConnections.current[peerId].ontrack = ({
                streams: [remoteStream],
            }) => {
                tracksNumber++;

                if (tracksNumber === 2) {
                    // video & audio tracks received
                    tracksNumber = 0;
                    addNewClient(peerId, () => {
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
                    });
                }
            };
            console.log(
                "peerConnections.current[" + peerId + "]:",
                peerConnections.current[peerId],
            );

            try {
                localMediaStream.current!.getTracks().forEach((track) => {
                    // добавляем контент, который будет отправляться.
                    peerConnections.current[peerId].addTrack(
                        track,
                        localMediaStream.current!,
                    );
                });
            }
            catch (error) {
                console.log("unable to get tracks!:", error);
            }

            if (shouldCreateOffer) {
                console.log("should create offer");
                // Если мы - сторона, которая подключилась.
                const offer =
                    await peerConnections.current[peerId].createOffer();

                console.log("setLocalDescription: ", offer);
                // При установке localDescription - сработает событие peerConnections[peerId].onIceCandidate.
                await peerConnections.current[peerId].setLocalDescription(
                    offer,
                );

                // Отправляем свои видео && аудио данные собеседнику.
                console.log("send offer: ", {
                    peerId,
                    sessionDescription: offer,
                });
                socket.emit("webrtc:relay-sdp", [
                    {
                        peerId,
                        sessionDescription: offer,
                    },
                ]);
            }
        }

        socket.on("webrtc:add-peer", handleNewPeer);

        return () => {
            socket.socket.off("webrtc:add-peer");
        };
    }, [addNewClient, socket]);

    // stage 3: session description
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

            console.log("stage 3: on session description: ", {
                peerId,
                sessionDescription: remoteDescription,
            });
            console.log(
                `peerConnections.current[${peerId}]`,
                peerConnections.current[peerId],
            );
            if (!peerConnections.current[peerId].remoteDescription) {
                await peerConnections.current[peerId].setRemoteDescription(
                    new RTCSessionDescription(remoteDescription),
                );
            }

            if (remoteDescription.type === "offer") {
                // Если это "offer", тогда создаем ответ.
                const answer =
                    await peerConnections.current[peerId].createAnswer();

                console.log("setRemoteDescription: ", answer);
                // Устанавливаем медиа-данные собеседника.
                await peerConnections.current[peerId].setLocalDescription(
                    answer,
                );

                // отправляем свои медиа-данные
                console.log("relay-sdp: send answer: ", {
                    peerId,
                    sessionDescription: answer,
                });
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

    const provideMediaRef = useCallback(
        (id: string, node: HTMLVideoElement) => {
            peerMediaElements.current[id] = node;
        },
        [],
    );

    // stage 4: ice candidate
    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on("webrtc:ice-candidate", ({ peerID, iceCandidate }) => {
            console.log("stage 4: on ice candidate");
            void peerConnections.current[peerID]?.addIceCandidate(
                new RTCIceCandidate(iceCandidate),
            );
        });
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

            updateClients(
                (list) => list.filter((c) => c !== peerId),
                () => {},
            );
        };

        socket.on("webrtc:remove-peer", handleRemovePeer);

        return () => {
            socket.socket.off("webrtc:remove-peer");
        };
    }, [socket, updateClients]);

    return { myId, clients, provideMediaRef };
};

export { useWebRTC };
