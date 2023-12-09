import { Room, RoomType, User } from "@prisma/client";
import { TMessage } from "../message/IMessage";
import { TValueOf } from "../models/TUtils";
import { TNormalizedParticipant } from "../participant/IParticipant";

export interface IRoom extends Room {
    messages: TMessage[];
    participants: TNormalizedParticipant[];
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

export const PrismaIncludeFullRoomInfo = {
    participants: {
        include: {
            user: {
                include: {
                    userOnline: true,
                    userTyping: true,
                },
            },
        },
    },
    usersTyping: true,
    creatorUser: true,
    pinnedMessages: {
        include: {
            message: true,
        },
    },
    messages: {
        include: {
            files: true,
            replyToMessage: {
                include: {
                    files: true,
                },
            },
            forwardedMessage: {
                include: {
                    files: true,
                    replyToMessage: {
                        include: {
                            files: true,
                        },
                    },
                },
            },
            usersDeletedThisMessage: true,
        },
        orderBy: {
            createdAt: "asc" as const,
        },
    },
};
