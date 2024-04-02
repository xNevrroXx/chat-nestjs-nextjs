import {
    Controller,
    ForbiddenException,
    Get,
    Param,
    Req,
    UseGuards,
} from "@nestjs/common";
import { MessageService } from "./message.service";
import { AuthGuard } from "../auth/auth.guard";
import { ParticipantService } from "../participant/participant.service";
import { PrismaIncludeFullRoomInfo } from "../room/IRooms";
import { Prisma } from "@prisma/client";

@Controller("message")
export class MessageController {
    constructor(
        private readonly participantService: ParticipantService,
        private readonly messageService: MessageService
    ) {}

    @Get(":id")
    @UseGuards(AuthGuard)
    async getById(@Req() request, @Param("id") id) {
        const userPayload = request.user;

        const message = (await this.messageService.findOne({
            where: {
                id: id,
            },
            include: {
                ...PrismaIncludeFullRoomInfo.messages.include,
            },
        })) as Prisma.MessageGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo.messages.include;
        }>;

        const isUserSender = await this.messageService.findOne({
            where: {
                id: id,
                senderId: userPayload.id,
            },
        });
        const isUserInMessageRoom = await this.participantService.findOne({
            where: {
                userId_roomId: {
                    userId: userPayload.id,
                    roomId: message.roomId,
                },
            },
        });
        const isUserGotForwardedMessage = await this.messageService.findMany({
            where: {
                AND: [
                    {
                        forwardedMessageId: id,
                    },
                    {
                        room: {
                            participants: {
                                some: {
                                    AND: {
                                        userId: {
                                            equals: userPayload.id,
                                        },
                                        roomId: {
                                            equals: message.roomId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        });

        if (
            !isUserSender &&
            !isUserInMessageRoom &&
            !isUserGotForwardedMessage
        ) {
            throw new ForbiddenException();
        }

        return await this.messageService.normalize(userPayload.id, message);
    }
}
