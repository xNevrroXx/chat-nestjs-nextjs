import { Room, RoomType, User } from "@prisma/client";
import { TMessage } from "../message/IMessage";
import { TValueOf } from "../models/TUtils";
import { TNormalizedParticipant } from "../participant/IParticipant";
import { IsString, Length } from "class-validator";

export interface IRoom extends Room {
    messages: TMessage[];
    participants: TNormalizedParticipant[];
    pinnedMessages: {
        id: string;
        messageId: string;
        text: string;
    }[];
    folderIds: string[];
}

export type TRoomPreview = {
    name?: string;
    type: RoomType;
    id: string;
};

export class NewRoom {
    @IsString()
    @Length(1, 30, {
        message: "Имя группы должно содержать от 1-го до 30-го символов",
    })
    name: string;

    type: typeof RoomType.GROUP;
    memberIds: TValueOf<Pick<User, "id">>[];
}

export const PrismaIncludeFullRoomInfo = {
    roomOnFolder: {
        select: {
            folderId: true,
        },
    },
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
                    usersDeletedThisMessage: true,
                },
            },
            forwardedMessage: {
                include: {
                    files: true,
                    replyToMessage: {
                        include: {
                            files: true,
                            usersDeletedThisMessage: true,
                        },
                    },
                    usersDeletedThisMessage: true,
                },
            },
            usersDeletedThisMessage: true,
        },
        orderBy: {
            createdAt: "asc" as const,
        },
    },
};
