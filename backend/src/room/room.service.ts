import { Injectable } from "@nestjs/common";
import { Prisma, Room, RoomType } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { PrismaIncludeFullRoomInfo, IRoom, TRoomPreview } from "./IRooms";
import { ParticipantService } from "../participant/participant.service";
import { TMessage } from "../message/IMessage";
import { MessageService } from "../message/message.service";

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly participantService: ParticipantService,
        private readonly messageService: MessageService
    ) {}

    async normalize(
        userId: string,
        unnormalizedRoom: Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>
    ): Promise<IRoom> {
        const normalizedMessages = await unnormalizedRoom.messages.reduce<
            Promise<TMessage[]>
        >(async (prevPromise, unnormalizedMessage) => {
            const prev = await prevPromise;

            const normalizedMessage = await this.messageService.normalize(
                userId,
                unnormalizedMessage
            );

            prev.push(normalizedMessage);
            return prev;
        }, Promise.resolve([]));

        const normalizedParticipants = unnormalizedRoom.participants
            .filter((participant) => participant.userId !== userId)
            .map(this.participantService.normalize);

        let roomName: string;
        if (unnormalizedRoom.type === RoomType.GROUP) {
            roomName = unnormalizedRoom.name;
        } else {
            roomName = normalizedParticipants[0].nickname;
        }

        return {
            ...unnormalizedRoom,
            name: roomName,
            participants: normalizedParticipants,
            messages: normalizedMessages,
            pinnedMessages: unnormalizedRoom.pinnedMessages.map(
                (pinnedMessage) => {
                    return {
                        id: pinnedMessage.id,
                        messageId: pinnedMessage.messageId,
                        text: pinnedMessage.message.text,
                    };
                }
            ),
        };
    }

    async joinRoom(userId: string, { id, type }: TRoomPreview): Promise<IRoom> {
        let newRoom: Prisma.RoomGetPayload<{
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                userOnline: true;
                                userTyping: true;
                            };
                        };
                    };
                };
            };
        }>;

        if (type === RoomType.PRIVATE) {
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
                include: {
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
                },
            })) as Prisma.RoomGetPayload<{
                include: {
                    participants: {
                        include: {
                            user: {
                                include: {
                                    userOnline: true;
                                    userTyping: true;
                                };
                            };
                        };
                    };
                };
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
                            include: {
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
                            },
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

        const roomFullInfo = await this.findOne({
            where: {
                id: newRoom.id,
            },
            include: PrismaIncludeFullRoomInfo,
        });

        return await this.normalize(userId, roomFullInfo as any);
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
}
