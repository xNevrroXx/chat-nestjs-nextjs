import { Injectable } from "@nestjs/common";
import { Prisma, PrismaPromise, Room, RoomType } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import {
    PrismaIncludeFullRoomInfo,
    IRoom,
    TRoomPreview,
    IMessagesByDays,
} from "./room.model";
import { ParticipantService } from "../participant/participant.service";
import { MessageService } from "../message/message.service";
import { DATE_FORMATTER_DATE } from "../utils/normalizeDate";
import { IRecentMessageInput } from "../message/message.model";
import { MessageBeingProcessedService } from "../message-being-processed/message-being-processed.service";

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly participantService: ParticipantService,
        private readonly messageBeingProcessedService: MessageBeingProcessedService,
        private readonly messageService: MessageService
    ) {}

    async leave(userId: string, roomId: string) {
        return this.participantService.update({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
            data: {
                isStillMember: false,
            },
        });
    }

    async normalize(
        userId: string,
        unnormalizedRoom: Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>
    ): Promise<IRoom> {
        const normalizedMessagesByDays = await unnormalizedRoom.messages.reduce<
            Promise<IMessagesByDays>
        >(async (prevPromise, unnormalizedMessage) => {
            const prev = await prevPromise;

            const normalizedMessage = await this.messageService.normalize(
                userId,
                unnormalizedMessage
            );
            const date = DATE_FORMATTER_DATE.format(
                new Date(normalizedMessage.createdAt)
            );

            if (!prev[date]) {
                prev[date] = [];
            }
            prev[date].push(normalizedMessage);

            return prev;
        }, Promise.resolve({}));

        const normalizedParticipants = unnormalizedRoom.participants.map(
            this.participantService.normalize
        );

        let roomName: string;
        let roomColor: string;
        switch (unnormalizedRoom.type) {
            case RoomType.GROUP: {
                roomName = unnormalizedRoom.name;
                roomColor = unnormalizedRoom.color;
                break;
            }
            case RoomType.PRIVATE: {
                const interlocutor = normalizedParticipants.find(
                    (member) => member.userId !== userId
                );

                if (interlocutor) {
                    roomName = interlocutor.displayName;
                    roomColor = interlocutor.color;
                }
                break;
            }
        }

        const unnormalizedProcessedMessage =
            unnormalizedRoom.messageBeingProcessed.find(
                (unsentMessage) => unsentMessage.senderId === userId
            );
        const normalizedProcessedMessage: IRecentMessageInput | null =
            unnormalizedProcessedMessage
                ? this.messageBeingProcessedService.normalize(
                      unnormalizedProcessedMessage
                  )
                : null;

        const result: IRoom & {
            roomOnFolder: unknown;
            messageBeingProcessed: unknown;
            messages: unknown;
        } = {
            ...unnormalizedRoom,
            name: roomName,
            color: roomColor,
            participants: normalizedParticipants,
            processedMessage: normalizedProcessedMessage,
            days: normalizedMessagesByDays,
            folderIds: unnormalizedRoom.roomOnFolder.map(
                (roomOnFolder) => roomOnFolder.folderId
            ),
            pinnedMessages: unnormalizedRoom.pinnedMessages.map(
                (pinnedMessage) => ({
                    pinDate: DATE_FORMATTER_DATE.format(
                        new Date(pinnedMessage.createdAt)
                    ),
                    message: {
                        id: pinnedMessage.message.id,
                        date: DATE_FORMATTER_DATE.format(
                            new Date(pinnedMessage.message.createdAt)
                        ),
                    },
                })
            ),
        };
        delete result.messageBeingProcessed;
        delete result.roomOnFolder;
        delete result.messages;

        return result;
    }

    async joinRoom(
        userId: string,
        { id, type, wasMember }: TRoomPreview
    ): Promise<IRoom> {
        let newRoom: Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>;

        if (wasMember) {
            const userAsParticipantInfo = (await this.participantService.update(
                {
                    where: {
                        userId_roomId: {
                            roomId: id,
                            userId: userId,
                        },
                    },
                    data: {
                        isStillMember: true,
                    },
                    include: {
                        room: {
                            include: PrismaIncludeFullRoomInfo,
                        },
                    },
                }
            )) as Prisma.ParticipantGetPayload<{
                include: {
                    room: {
                        include: typeof PrismaIncludeFullRoomInfo;
                    };
                };
            }>;

            newRoom = userAsParticipantInfo.room;
        } else if (type === RoomType.PRIVATE) {
            newRoom = (await this.create({
                data: {
                    type,
                    participants: {
                        createMany: {
                            data: [
                                {
                                    userId: userId,
                                },
                                {
                                    userId: id,
                                },
                            ],
                        },
                    },
                },
                include: PrismaIncludeFullRoomInfo,
            })) as Prisma.RoomGetPayload<{
                include: typeof PrismaIncludeFullRoomInfo;
            }>;
        } else {
            const userAsParticipantInfo = (await this.participantService.create(
                {
                    data: {
                        room: {
                            connect: {
                                id,
                            },
                        },
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                    include: {
                        room: {
                            include: PrismaIncludeFullRoomInfo,
                        },
                    },
                }
            )) as Prisma.ParticipantGetPayload<{
                include: {
                    room: {
                        include: typeof PrismaIncludeFullRoomInfo;
                    };
                };
            }>;

            newRoom = userAsParticipantInfo.room;
        }

        return this.normalize(userId, newRoom);
    }

    async findOne<T extends Prisma.RoomInclude>(params: {
        where: Prisma.RoomWhereUniqueInput;
        include?: T;
    }): Promise<Room | null> {
        const { where, include } = params;

        return this.prisma.room.findUnique({
            where,
            include,
        });
    }

    async findMany<T extends Prisma.RoomInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RoomWhereUniqueInput;
        where?: Prisma.RoomWhereInput;
        orderBy?: Prisma.RoomOrderByWithRelationInput;
        select?: Prisma.RoomSelect;
        include?: T;
    }): Promise<Prisma.RoomGetPayload<{ include: T }>[] | Room[]> {
        const { skip, take, cursor, where, orderBy, include } = params;

        return this.prisma.room.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include,
        });
    }

    async create<T extends Prisma.RoomInclude>(params: {
        data: Prisma.RoomCreateInput;
        include?: T;
    }): Promise<Prisma.RoomGetPayload<{ include: T }> | Room | null> {
        return this.prisma.room.create(params);
    }

    async update<T extends Prisma.RoomInclude>(params: {
        where: Prisma.RoomWhereUniqueInput;
        data: Prisma.RoomUpdateInput;
        include?: T;
    }): Promise<Prisma.RoomGetPayload<{ include: T }> | Room | null> {
        const { where, data, include } = params;

        return this.prisma.room.update({
            where,
            data,
            include,
        });
    }

    async delete(where: Prisma.RoomWhereUniqueInput): Promise<Room> {
        return this.prisma.room.delete({
            where,
        });
    }
    async deleteMany(params: {
        where?: Prisma.RoomWhereInput;
    }): Promise<PrismaPromise<Prisma.BatchPayload>> {
        const { where } = params;

        return this.prisma.room.deleteMany({
            where,
        });
    }
}
