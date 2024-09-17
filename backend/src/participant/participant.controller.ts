import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { ParticipantService } from "./participant.service";
import { ChatGateway } from "../chat/chat.gateway";
import { AuthGuard } from "../auth/auth.guard";
import {
    TInviteUsers,
    TRequestedMember,
    TResultInvitingUsers,
} from "./participant.model";
import { DatabaseService } from "../database/database.service";
import { Prisma, RoomType } from "@prisma/client";
import { RoomService } from "../room/room.service";
import { PrismaIncludeFullRoomInfo } from "../room/room.model";

@Controller("room/participant")
export class ParticipantController {
    constructor(
        private readonly participantService: ParticipantService,
        private readonly socketService: ChatGateway,
        private readonly roomService: RoomService,
        private readonly prismaService: DatabaseService
    ) {}

    @Post("/invite")
    @UseGuards(AuthGuard)
    async invite(
        @Req() request,
        @Body() { roomId, mentionIds }: TInviteUsers
    ): Promise<TResultInvitingUsers> {
        const userId: string = request.user.id;

        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
                participant: {
                    some: {
                        userId,
                        roomId,
                        isStillMember: true,
                        room: {
                            type: RoomType.GROUP,
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new BadRequestException();
        }

        const date = new Date();
        const resultInviting = (await this.prismaService.$transaction(
            mentionIds.map((invitedUserId) => {
                return this.prismaService.participant.upsert({
                    where: {
                        userId_roomId: {
                            roomId,
                            userId: invitedUserId,
                        },
                    },
                    create: {
                        roomId,
                        userId: invitedUserId,
                        createdAt: date,
                    },
                    update: {},
                    include: {
                        user: {
                            include: {
                                userTyping: true,
                            },
                        },
                    },
                });
            })
        )) as Prisma.ParticipantGetPayload<{
            include: {
                user: {
                    include: {
                        userTyping: true;
                    };
                };
            };
        }>[];

        const unnormalizedRoom = (await this.roomService.findOne({
            where: {
                id: roomId,
            },
            include: PrismaIncludeFullRoomInfo,
        })) as Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>;

        const successfullyInvitedUsers = resultInviting.filter(
            (prismaResult) =>
                prismaResult.createdAt.getTime() === date.getTime()
        );
        successfullyInvitedUsers.forEach((newParticipant) => {
            this.socketService.server
                .in(newParticipant.userId)
                .socketsJoin(roomId);

            this.roomService
                .normalize(newParticipant.userId, unnormalizedRoom)
                .then((room) => {
                    this.socketService.server
                        .to(newParticipant.userId)
                        .emit("room:add-or-update", room);
                });
        });

        return {
            roomId,
            requestedMembers: resultInviting.map<TRequestedMember>(
                (prismaResult) => {
                    if (prismaResult.createdAt.getTime() !== date.getTime()) {
                        // this query wasn't done
                        return {
                            status: "rejected",
                            reason: "The user is already a member of the group or has preferred to leave it.",
                        };
                    }

                    const normalizedParticipant =
                        this.participantService.normalize(prismaResult);
                    return {
                        status: "fulfilled",
                        value: normalizedParticipant,
                    };
                }
            ),
        };
    }
}
