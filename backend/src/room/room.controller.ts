import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    UseFilters,
    UseGuards,
} from "@nestjs/common";
import { stringSimilarity } from "string-similarity-js";
import { Request } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { RoomService } from "./room.service";
import { Message, Prisma, RoomType, User } from "@prisma/client";
import {
    IRoom,
    TRoomPreview,
    NewRoom,
    PrismaIncludeFullRoomInfo,
} from "./IRooms";
import { DatabaseService } from "../database/database.service";
import { IUserSessionPayload } from "../user/IUser";
import { TNormalizedList } from "../models/TNormalizedList";
import { generateRandomBrightColor } from "../utils/generateRandomBrightColor";
import { MessageService } from "../message/message.service";
import { WsExceptionFilter } from "../exceptions/ws-exception.filter";
import { ChatGateway } from "../chat/chat.gateway";

@Controller("room")
export class RoomController {
    constructor(
        private readonly messageService: MessageService,
        private readonly roomService: RoomService,
        private readonly prismaService: DatabaseService,
        private readonly socketService: ChatGateway
    ) {}

    @Delete("clear-my-history")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async clearMyHistory(
        @Req() request,
        @Body() { roomId }: { roomId: string }
    ) {
        const userInfo = request.user;

        const messageIdsWithUserIds = (
            (await this.messageService.findMany({
                where: {
                    roomId,
                    room: {
                        participants: {
                            some: {
                                userId: userInfo.id,
                            },
                        },
                    },
                },
            })) as Message[]
        ).map((msg) => {
            return {
                userId: userInfo.id,
                messageId: msg.id,
            };
        });

        await this.prismaService.userOnDeletedMessage.createMany({
            data: messageIdsWithUserIds,
        });
    }

    @Delete(":id")
    @UseGuards(AuthGuard)
    async delete(
        @Req() request,
        @Body("isOnlyForMe") isOnlyForMe: boolean,
        @Param("id") roomId: string
    ) {
        const userInfo = request.user;

        const userWhoLeft =
            this.socketService.socketRoomsInfo.leaveRoomByUserId(
                userInfo.id,
                roomId
            );
        userWhoLeft.clientIds.forEach((socketId) => {
            const client = this.socketService.server.sockets.get(socketId);
            client.leave(roomId);
            client.emit("room:delete", { id: roomId });
        });

        if (!isOnlyForMe) {
            // delete all records about the room
            await this.prismaService.room.delete({
                where: {
                    id: roomId,
                    OR: [
                        {
                            creatorUserId: userInfo.id,
                        },
                        {
                            type: RoomType.PRIVATE,
                            participants: {
                                some: {
                                    userId: userInfo.id,
                                },
                            },
                        },
                    ],
                },
            });

            this.socketService.server
                .to(roomId)
                .emit("room:delete", { id: roomId });
        } else {
            // clear a history and leave the room
            const messageIdsWithUserIds = (
                (await this.messageService.findMany({
                    where: {
                        roomId: roomId,
                        room: {
                            participants: {
                                some: {
                                    userId: userInfo.id,
                                },
                            },
                        },
                    },
                })) as Message[]
            ).map((msg) => {
                return {
                    userId: userInfo.id,
                    messageId: msg.id,
                };
            });

            await this.prismaService.userOnDeletedMessage.createMany({
                data: messageIdsWithUserIds,
                skipDuplicates: true,
            });

            await this.roomService.leave(userInfo.id, roomId);

            void this.socketService.toggleTypingStatus({
                userId: userWhoLeft.userId,
                isTyping: false,
                roomId: roomId,
            });

            this.socketService.server.to(roomId).emit("room:user-left", {
                roomId: roomId,
                userId: userWhoLeft.userId,
            });
        }
    }

    @Post("create")
    @UseGuards(AuthGuard)
    async create(
        @Req() request,
        @Body() { memberIds, name, type }: NewRoom
    ): Promise<IRoom> {
        const userInfo = request.user;

        const newRoom = (await this.roomService.create({
            data: {
                type,
                name,
                creatorUser: {
                    connect: {
                        id: userInfo.id,
                    },
                },
                color: generateRandomBrightColor(),
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
            include: PrismaIncludeFullRoomInfo,
        })) as Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>;

        return await this.roomService.normalize(userInfo.id, newRoom);
    }

    @Post("join")
    @UseGuards(AuthGuard)
    async join(@Req() request, @Body() roomInfo: TRoomPreview) {
        const userInfo = request.user;
        return await this.roomService.joinRoom(userInfo.id, roomInfo);
    }

    @Get("all")
    @UseFilters(new WsExceptionFilter())
    @UseGuards(AuthGuard)
    async getAll(@Req() request): Promise<TNormalizedList<IRoom>> {
        const userPayload = request.user;

        const unnormalizedRooms = (await this.roomService.findMany({
            where: {
                participants: {
                    some: {
                        AND: [
                            {
                                userId: {
                                    equals: userPayload.id,
                                },
                            },
                            {
                                isStillMember: true,
                            },
                        ],
                    },
                },
            },
            include: PrismaIncludeFullRoomInfo,
        })) as Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>[];

        const normalizedRoomPromises: Promise<IRoom>[] = unnormalizedRooms.map(
            (room) => {
                return this.roomService.normalize(userPayload.id, room);
            }
        );

        const normalizedRooms = await Promise.all(normalizedRoomPromises);

        return normalizedRooms.reduce<TNormalizedList<IRoom>>(
            (prev, curr) => {
                prev = {
                    values: {
                        byId: {
                            ...prev.values.byId,
                            [curr.id]: curr,
                        },
                    },
                    allIds: prev.allIds.concat(curr.id),
                };
                return prev;
            },
            {
                values: {
                    byId: {},
                },
                allIds: [],
            }
        );
    }

    @Get("find-by-query")
    @UseGuards(AuthGuard)
    async getManyByQuery(
        @Req() request: Request,
        @Query("query") query: string,
        @Query("isOnlyUsers") isOnlyUsers?: boolean
    ) /*: Promise<TRoomPreview[]>*/ {
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
                       AND intersecting_room.type = 'PRIVATE'
                ) ON u.id = p.user_id
            WHERE
                u.is_deleted <> 1
                AND u.id <> ${userPayload.id}
                AND target_user_participant.user_id is null
                AND
                    (
                        u.display_name LIKE ${"%" + query + "%"}
                        OR
                        CONCAT(u.given_name, ' ', u.family_name) LIKE ${
                            "%" + query + "%"
                        }
                    );
        `;

        const rooms = isOnlyUsers
            ? []
            : ((await this.roomService.findMany({
                  where: {
                      OR: [
                          {
                              // just a group room with an appropriate name.
                              AND: [
                                  {
                                      type: RoomType.GROUP,
                                  },
                                  {
                                      name: {
                                          contains: query as string,
                                      },
                                  },
                                  {
                                      OR: [
                                          {
                                              participants: {
                                                  every: {
                                                      userId: {
                                                          not: userPayload.id,
                                                      },
                                                  },
                                              },
                                          },
                                          {
                                              participants: {
                                                  some: {
                                                      userId: userPayload.id,
                                                      isStillMember: false,
                                                  },
                                              },
                                          },
                                      ],
                                  },
                              ],
                          },
                          {
                              AND: [
                                  {
                                      // 1) a private room
                                      type: RoomType.PRIVATE,
                                  },
                                  {
                                      // 2) I've been in this room before
                                      participants: {
                                          some: {
                                              userId: userPayload.id,
                                              isStillMember: false,
                                          },
                                      },
                                  },
                                  {
                                      // 3) the interlocutor shouldn't be a deleted user
                                      participants: {
                                          some: {
                                              user: {
                                                  id: {
                                                      not: userPayload.id,
                                                  },
                                                  isDeleted: false,
                                              },
                                          },
                                      },
                                  },
                              ],
                          },
                      ],
                  },
                  include: PrismaIncludeFullRoomInfo,
              })) as Prisma.RoomGetPayload<{
                  include: typeof PrismaIncludeFullRoomInfo;
              }>[]);

        const roomsAndUsers: Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>[] = users
            .map<
                Prisma.RoomGetPayload<{
                    include: typeof PrismaIncludeFullRoomInfo;
                }>
            >((user) => {
                // Here we have the FAKE room id, because we don't have the private room with this user,
                // so we use the user interlocutor id
                return {
                    id: user.id,
                    name: user.displayName,
                    type: RoomType.PRIVATE,
                    participants: [
                        {
                            userId: user.id,
                            roomId: user.id,
                            isStillMember: true,
                            color: user.color,
                            nickname: user.displayName,
                            user: {
                                ...user,
                                userTyping: {
                                    id: "123",
                                    roomId: user.id,
                                    userId: user.id,
                                    updatedAt: null,
                                    isTyping: false,
                                },
                                userOnline: {
                                    id: "123",
                                    roomId: user.id,
                                    userId: user.id,
                                    updatedAt: null,
                                    isOnline: false,
                                },
                            },
                            createdAt: null,
                            updatedAt: null,
                        },
                    ],
                    usersTyping: [],
                    pinnedMessages: [],
                    messages: [],
                    roomOnFolder: [],
                    wasMember: false,
                    creatorUserId: null,
                    creatorUser: null,
                    updatedAt: null,
                    createdAt: null,
                    color: null,
                    isPreview: true,
                };
            })
            .concat(
                rooms.map((room) => ({
                    ...room,
                    isPreview: true,
                    wasMember: room.participants.some(
                        (member) => member.userId === userPayload.id
                    ),
                }))
            )
            .sort((room1, room2) => {
                return (
                    stringSimilarity(query as string, room2.name || "") -
                    stringSimilarity(query as string, room1.name || "")
                );
            });

        const normalizedRoomPromises: Promise<IRoom>[] = roomsAndUsers.map(
            (room) => {
                return this.roomService.normalize(userPayload.id, room);
            }
        );
        const normalizedRooms = await Promise.all(normalizedRoomPromises);
        return normalizedRooms
            .filter((room) =>
                room.name.toLowerCase().includes(query.toLowerCase())
            )
            .sort((room) =>
                stringSimilarity(query as string, room.name)
            ) as TRoomPreview[];
    }
}
