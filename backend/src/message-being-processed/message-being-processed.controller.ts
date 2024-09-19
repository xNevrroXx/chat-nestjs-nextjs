import {
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

@Controller("message-processed")
export class MessageBeingProcessedController {
    constructor(
        private readonly messageBeingProcessedService: MessageBeingProcessedService,
        private readonly eventsService: ChatGateway
    ) {}

    @Put()
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(AuthGuard)
    async update(@Req() request: Request, @Body() data: RecentMessageDto) {
        const userId = (request.user as IUserSessionPayload).id;
        const userSocketId = request.cookies["socket_id"];

        void this.messageBeingProcessedService.upsert({
            ...data,
            userId,
        });

        this.eventsService.server
            .to(userId)
            .except(userSocketId)
            .emit("message:recent-typing-info", data);
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
