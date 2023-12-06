import { Room, RoomType, User } from "@prisma/client";
import { TMessage } from "../message/IMessage";
import { TValueOf } from "../models/TUtils";

export interface IRoom extends Room {
    messages: TMessage[];
    pinnedMessages: {
        id: string;
        messageId: string;
        text: string;
    }[];
}

export type TRoomPreview = {
    name?: string;
    type: RoomType;
    id: string;
};

export type TNewRoom = {
    name: string;
    type: typeof RoomType.GROUP;
    memberIds: TValueOf<Pick<User, "id">>[];
};
