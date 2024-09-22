import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Put,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { RecentMessageDto } from "../message/message.dto";
import { MessageBeingProcessedService } from "./message-being-processed.service";
import { ChatGateway } from "../chat/chat.gateway";
import { Request } from "express";
import { IUserSessionPayload } from "../user/user.model";
import { RoomService } from "../room/room.service";
import {
    MessageBeingProcessedPrisma,
    TNormalizedRecentMessageInput,
} from "../message/message.model";

@Controller("message-processed")
export class MessageBeingProcessedController {
    constructor(
        private readonly messageBeingProcessedService: MessageBeingProcessedService,
        private readonly eventsService: ChatGateway,
        private readonly roomService: RoomService
    ) {}

    @Get("all")
    @HttpCode(200)
    @UseGuards(AuthGuard)
    async getAll(@Req() request: Request): Promise<{
        recentInputInfo: {
            roomId: string;
            input: TNormalizedRecentMessageInput;
        }[];
    }> {
        const userId = (request.user as IUserSessionPayload).id;

        const unnormalizedProcessedMessages =
            await this.messageBeingProcessedService.findMany({
                where: {
                    senderId: userId,
                },
                include: MessageBeingProcessedPrisma,
            });

        return {
            recentInputInfo: unnormalizedProcessedMessages.map((msg) => ({
                roomId: msg.roomId,
                input: this.messageBeingProcessedService.normalize(msg),
            })),
        };
    }

    @Put()
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(AuthGuard)
    async update(@Req() request: Request, @Body() data: RecentMessageDto) {
        const userId = (request.user as IUserSessionPayload).id;
        const userSocketId = request.cookies["socket_id"];

        const isUserInRoom = await this.roomService.findOne({
            where: {
                id: data.roomId,
                participants: {
                    some: {
                        userId,
                        isStillMember: true,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException();
        }

        await this.messageBeingProcessedService.upsert({
            ...data,
            userId,
        });

        const resultToSendOut =
            await this.messageBeingProcessedService.getFullProcessedMessageInfo(
                { userId, roomId: data.roomId }
            );

        this.eventsService.server
            .to(userId)
            .except(userSocketId)
            .emit("recent-rooms:change-typing-info", resultToSendOut);
    }

    @Get()
    @UseGuards(AuthGuard)
    async get(@Req() request, @Query("roomId") roomId: string) {
        const userId = request.user.id;

        try {
            const response = await this.messageBeingProcessedService.findOne({
                where: {
                    senderId_roomId: {
                        senderId: userId,
                        roomId: roomId,
                    },
                },
                include: {
                    files: true,
                },
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }
}
