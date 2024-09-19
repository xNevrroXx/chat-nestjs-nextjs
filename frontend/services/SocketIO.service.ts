import { io, Socket } from "socket.io-client";
import {
    IClientToServerEvents,
    IServerToClientEvents,
} from "@/models/ISocket-io";
import { TValueOf } from "@/models/TUtils";
import $api from "@/http";

class SocketIOService {
    public socket: Socket<IServerToClientEvents, IClientToServerEvents>;

    constructor(sessionId: string) {
        this.socket = io(process.env.NEXT_PUBLIC_BASE_SOCKET_URL || "", {
            autoConnect: false,
            transportOptions: {
                polling: {
                    extraHeaders: {
                        sessionId: sessionId,
                    },
                },
            },
        });
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.on("connect", async () => {
                await $api.post(
                    process.env.NEXT_PUBLIC_BASE_URL + "/auth/set-socket-id",
                    {
                        socketId: this.socket.id,
                    },
                );
                resolve();
            });
            this.socket.on("connect_error", (error) => {
                reject(error);
            });

            this.socket.connect();
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            this.socket.on("disconnect", () => {
                this.socket.removeAllListeners();
                resolve();
            });

            this.socket.disconnect();
        });
    }

    emit<Event extends keyof IClientToServerEvents>(
        event: Event,
        data: Parameters<IClientToServerEvents[Event]>,
    ) {
        this.socket.emit(event, ...data);
    }

    on<Event extends keyof IServerToClientEvents>(
        event: Event,
        fn: TValueOf<Pick<IServerToClientEvents, Event>>,
    ) {
        if (!this.socket) {
            return;
        }

        // @ts-ignore
        this.socket.on(event, fn);
    }
}

export { SocketIOService };
