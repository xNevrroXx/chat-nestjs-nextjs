import { Room, RoomType } from "@prisma/client";
import { TMessage } from "../message/IMessage";

export interface IRoom extends Room {
    messages: TMessage[];
    pinnedMessages: {
        id: string;
        messageId: string;
        text: string;
    }[];
}

export type TPreviewRooms = { id: string; name?: string; type: RoomType };

export type TNewGroupRoom = { name: string; type: typeof RoomType.GROUP };
