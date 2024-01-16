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
import { Prisma, RoomType, User } from "@prisma/client";
import { UserService } from "../user/user.service";
import {
    IRoom,
    PrismaIncludeFullRoomInfo,
    TNewRoom,
    TRoomPreview,
} from "./IRooms";
import { DatabaseService } from "../database/database.service";
import { IUserSessionPayload } from "../user/IUser";
import { TNormalizedList } from "../models/TNormalizedList";

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

        const newRoom = (await this.roomService.create({
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
    @UseGuards(AuthGuard)
    async getAll(@Req() request): Promise<TNormalizedList<IRoom>> {
        const userPayload = request.user;

        const unnormalizedRooms = (await this.roomService.findMany({
            where: {
                participants: {
                    some: {
                        userId: {
                            equals: userPayload.id,
                        },
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
    ): Promise<TRoomPreview[]> {
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
                  include: PrismaIncludeFullRoomInfo,
              })) as Prisma.RoomGetPayload<{
                  include: typeof PrismaIncludeFullRoomInfo;
              }>[]);

        const roomsAndUsers = users
            .map<TRoomPreview>((user) => {
                // Here we have the FAKE room id, because we don't have the private room with this user,
                // so we use the user interlocutor id
                return {
                    id: user.id,
                    name: user.displayName,
                    type: RoomType.PRIVATE,
                    participants: [
                        {
                            userId: user.id,
                        },
                    ],
                    pinnedMessages: [],
                    messages: [],
                };
            })
            .concat(
                ...rooms.map<TRoomPreview>((room) => {
                    return {
                        id: room.id,
                        name: room.name,
                        type: RoomType.GROUP,
                        participants: [],
                        pinnedMessages: [],
                        messages: [],
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
