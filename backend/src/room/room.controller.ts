import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { stringSimilarity } from "string-similarity-js";
import { Request } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { RoomService } from "./room.service";
import { MessageService } from "../message/message.service";
import { ParticipantService } from "../participant/participant.service";
import { Prisma, Room, RoomType, User } from "@prisma/client";
import { UserService } from "../user/user.service";
import { IRoom, TNewRoom, TPreviewRooms } from "./IRooms";
import { TMessage } from "../message/IMessage";
import { DatabaseService } from "../database/database.service";
import { IUserSessionPayload } from "../user/IUser";

@Controller("room")
export class RoomController {
    constructor(
        private readonly participantService: ParticipantService,
        private readonly messageService: MessageService,
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly prismaService: DatabaseService
    ) {}

    @Post("create")
    @UseGuards(AuthGuard)
    async create(
        @Req() request,
        @Body() { memberIds, name, type }: TNewRoom
    ): Promise<IRoom> {
        const userInfo = request.user;

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
        switch (type) {
            case "PRIVATE": {
                newRoom = (await this.roomService.create({
                    data: {
                        type,
                        participants: {
                            createMany: {
                                data: [
                                    {
                                        userId: userInfo.id,
                                    },
                                    {
                                        userId: memberIds[0],
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
                break;
            }
            case "GROUP": {
                newRoom = (await this.roomService.create({
                    data: {
                        type,
                        name,
                        participants: {
                            createMany: {
                                data: [
                                    {
                                        userId: userInfo.id,
                                    },
                                    ...memberIds.map((id) => ({
                                        userId: id,
                                    })),
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
                break;
            }
        }

        const normalizedParticipants = newRoom.participants
            .filter((participant) => participant.userId !== userInfo.id)
            .map(this.participantService.normalize);

        let roomName: string;
        if (newRoom.type === RoomType.GROUP) {
            roomName = newRoom.name;
        } else {
            roomName = normalizedParticipants[0].nickname;
        }

        return {
            ...newRoom,
            name: roomName,
            participants: normalizedParticipants,
            messages: [],
            pinnedMessages: [],
        } as IRoom;
    }

    @Get("all")
    @UseGuards(AuthGuard)
    async getAll(@Req() request): Promise<IRoom[]> {
        const userPayload = request.user;

        const unnormalizedRooms = (await this.roomService.findMany({
            skip: 0,
            take: 10,
            where: {
                participants: {
                    some: {
                        userId: {
                            equals: userPayload.id,
                        },
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
                        createdAt: "asc",
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
                usersTyping: true;
                creatorUser: true;
                pinnedMessages: {
                    include: {
                        message: true;
                    };
                };
                messages: {
                    include: {
                        files: true;
                        replyToMessage: {
                            include: {
                                files: true;
                            };
                        };
                        forwardedMessage: {
                            include: {
                                files: true;
                                replyToMessage: {
                                    include: {
                                        files: true;
                                    };
                                };
                            };
                        };
                        usersDeletedThisMessage: true;
                    };
                };
            };
        }>[];

        const normalizedRoomPromises: Promise<IRoom>[] = unnormalizedRooms.map(
            async (unnormalizedRoom) => {
                const normalizedMessages =
                    await unnormalizedRoom.messages.reduce<Promise<TMessage[]>>(
                        async (prevPromise, unnormalizedMessage) => {
                            const prev = await prevPromise;

                            const normalizedMessage =
                                await this.messageService.normalize(
                                    userPayload.id,
                                    unnormalizedMessage
                                );

                            prev.push(normalizedMessage);
                            return prev;
                        },
                        Promise.resolve([])
                    );

                const normalizedParticipants = unnormalizedRoom.participants
                    .filter(
                        (participant) => participant.userId !== userPayload.id
                    )
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
        );

        return await Promise.all(normalizedRoomPromises);
    }

    @Get("find-by-query")
    @UseGuards(AuthGuard)
    async getManyBySearch(
        @Req() request: Request,
        @Query("query") query: string,
        @Query("isOnlyUsers") isOnlyUsers?: boolean
    ): Promise<TPreviewRooms[]> {
        // todo add a boolean flag to specify whether to find users by their firstname + lastname or just by their nickname
        const userPayload = request.user as IUserSessionPayload;

        const users = await this.prismaService.$queryRaw<User[]>`
            SELECT u.*, u.display_name as 'displayName'
            FROM user u
                LEFT JOIN (participant as p
                    INNER JOIN participant as target_user_participant
                        ON target_user_participant.user_id = ${userPayload.id}
                            INNER JOIN room as intersecting_room
                               ON target_user_participant.room_id = intersecting_room.id
                       AND p.room_id = target_user_participant.room_id
                       AND intersecting_room.type = "PRIVATE"
                ) ON u.id = p.user_id
            WHERE
                target_user_participant.user_id is null
                AND
                    (
                        u.display_name LIKE ${"%" + query + "%"}
                        OR
                        CONCAT(u.given_name, " ", u.family_name) LIKE ${
                            "%" + query + "%"
                        }
                    )
                AND u.id <> ${userPayload.id};
        `;
        console.log("users: ", users);

        const rooms = isOnlyUsers
            ? []
            : ((await this.roomService.findMany({
                  where: {
                      AND: [
                          {
                              name: {
                                  contains: query as string,
                              },
                          },
                          {
                              participants: {
                                  every: {
                                      userId: {
                                          not: userPayload.id,
                                      },
                                  },
                              },
                          },
                      ],
                  },
              })) as Room[]);

        const roomsAndUsers = users
            .map<TPreviewRooms>((user) => {
                return {
                    id: user.id,
                    name: user.displayName,
                    type: RoomType.PRIVATE,
                };
            })
            .concat(
                ...rooms.map<TPreviewRooms>((room) => {
                    return {
                        id: room.id,
                        name: room.name,
                        type: RoomType.GROUP,
                    };
                })
            )
            // .filter((room) =>
            //     room.name
            //         .toLowerCase()
            //         .includes((query as string).toLowerCase())
            // )
            .sort((room1, room2) => {
                return (
                    stringSimilarity(query as string, room2.name) -
                    stringSimilarity(query as string, room2.name)
                );
            });

        return roomsAndUsers.sort((user) =>
            stringSimilarity(query as string, user.name)
        );
    }
}
