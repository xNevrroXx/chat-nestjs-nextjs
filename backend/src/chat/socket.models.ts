import { TNewMessage } from "./chat.models";

export interface IServerToClientEvents {
    message: (data: TNewMessage) => void;
}

export interface IClientToServerEvents {
    message: (data: TNewMessage) => void;
}
