import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayDisconnect,
    OnGatewayConnection,
    ConnectedSocket,
    WsException,
} from "@nestjs/websockets";
import {
    Logger,
    UseFilters,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { Namespace } from "socket.io";
// own modules
import { WsAuthGuard } from "../auth/ws-auth.guard";
import { UserService } from "../user/user.service";
import { AuthService } from "../auth/auth.service";
import { MessageService } from "../message/message.service";
import { RoomService } from "../room/room.service";
import { ParticipantService } from "../participant/participant.service";
import { SocketRoomsInfo } from "./SocketRoomsInfo.class";
import { brToNewLineChars } from "../utils/brToNewLineChars ";
import { codeBlocksToHTML } from "../utils/codeBlocksToHTML";
// types
import {
    TToggleUserTyping,
    TNewForwardedMessage,
    TNewEditedMessage,
    TDeleteMessage,
    TPinMessage,
    TUnpinnedMessage,
    TUnpinMessage,
} from "./chat.model";
import { FileProcessedMessages, Prisma, Room } from "@prisma/client";
import { PrismaIncludeFullRoomInfo } from "../room/room.model";
import {
    ForwardedMessagePrisma,
    isInnerForwardedMessage,
    TPinnedMessagesByRoom,
} from "../message/message.model";
import { DATE_FORMATTER_DATE } from "../utils/normalizeDate";
import { RoomsOnFoldersService } from "../rooms-on-folders/rooms-on-folders.service";
import { WsExceptionFilter } from "../exceptions/ws-exception.filter";
import { IInitCall, ILeaveCall, IRelayIce, IRelaySdp } from "./webrtc.models";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import {
    IClientToServerEvents,
    IServerToClientEvents,
    TSocketWithPayload,
} from "./socket.model";
import { MessageDto } from "../message/message.dto";

@WebSocketGateway({
    namespace: "api/chat",
    cors: {
        origin: "*",
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Namespace<IClientToServerEvents, IServerToClientEvents>;
    socketRoomsInfo: SocketRoomsInfo;
    private logger = new Logger("ChatGateway");

    constructor(
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly messageService: MessageService,
        private readonly participantService: ParticipantService,
        private readonly roomsOnFoldersService: RoomsOnFoldersService
    ) {
        this.socketRoomsInfo = new SocketRoomsInfo();
    }

    async handleConnection(@ConnectedSocket() client: TSocketWithPayload) {
        const userInfo = await this.authService.verify(
            client.handshake.headers.sessionid as string
        );
        client.join(userInfo.id);
        this.socketRoomsInfo.initConnection(userInfo.id, client.id);
        this.logger.log("handle connection: ", userInfo.id);

        const clientIds = this.socketRoomsInfo.getSocketIdsByUserId(
            userInfo.id
        );

        const userRooms: Room[] = await this.roomService.findMany({
            where: {
                participants: {
                    some: {
                        AND: [
                            {
                                userId: {
                                    equals: userInfo.id,
                                },
                            },
                            {
                                isStillMember: {
                                    equals: true,
                                },
                            },
                        ],
                    },
                },
            },
        });

        const roomIds = userRooms.map((room) => room.id);
        this.server.in(userInfo.id).socketsJoin(roomIds);

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userInfo.id,
            isOnline: true,
        });

        if (clientIds.size > 1) {
            // if this is not the user's first device connected to the server
            return;
        }

        this.socketRoomsInfo.join(userInfo.id, roomIds);
        this.server
            .to(roomIds)
            .except(userInfo.id)
            .emit("user:toggle-online", userOnline);
    }

    async handleDisconnect(@ConnectedSocket() client: TSocketWithPayload) {
        const userId = this.socketRoomsInfo.getUserIdBySocketId(client.id);
        client.leave(userId);

        const userToRoomInfo = this.socketRoomsInfo.leaveAll(client.id);
        if (!userToRoomInfo) {
            // so, the user has other devices connected to the server.
            return;
        }
        const { roomIds } = userToRoomInfo;

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userId,
            isOnline: false,
        });

        this.server
            .to(Array.from(roomIds))
            .emit("user:toggle-online", userOnline);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("room:join-or-create")
    async joinNewRoom(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() socketMessage: { id: string }
    ) {
        const unnormalizedRoom = (await this.roomService.findOne({
            where: {
                id: socketMessage.id,
            },
            include: PrismaIncludeFullRoomInfo,
        })) as Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>;

        for (let i = 0; i < unnormalizedRoom.participants.length; i++) {
            const participant = unnormalizedRoom.participants[i];
            if (!participant.isStillMember) {
                continue;
            }
            // the participants of the new room aren't connected to it
            this.server.in(participant.userId).socketsJoin(unnormalizedRoom.id);
            this.socketRoomsInfo.joinIfConnected(
                unnormalizedRoom.id,
                participant.userId
            );

            this.roomService
                .normalize(participant.userId, unnormalizedRoom)
                .then((room) => {
                    this.server
                        .to(participant.userId)
                        .except(client.id)
                        .emit("room:add-or-update", room);
                });
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("room:leave")
    async leaveRoom(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() { roomId }: { roomId: string }
    ) {
        const userId = client.user.id;

        await this.roomService.update({
            where: {
                id: roomId,
            },
            data: {
                participants: {
                    update: {
                        where: {
                            userId_roomId: {
                                roomId,
                                userId,
                            },
                        },
                        data: {
                            isStillMember: false,
                            updatedAt: new Date(),
                        },
                    },
                },
            },
        });

        const userFoldersWithLeavedRoom =
            await this.roomsOnFoldersService.findMany({
                where: {
                    userId,
                    roomOnFolder: {
                        some: {
                            roomId,
                        },
                    },
                },
            });

        userFoldersWithLeavedRoom.forEach((folder) => {
            void this.roomsOnFoldersService.removeRoomFromFolder({
                where: {
                    folderId_roomId: {
                        roomId: roomId,
                        folderId: folder.id,
                    },
                },
            });
        });

        const userWhoLeft = this.socketRoomsInfo.leaveRoomByUserId(
            userId,
            roomId
        );
        client.leave(roomId);

        void this.toggleTypingStatus({
            userId: userWhoLeft.userId,
            isTyping: false,
            roomId,
        });
        this.server
            .to(roomId)
            .emit("room:user-left", { roomId, userId: userWhoLeft.userId });
        // after notification - it will disconnect another user's devices.
        userWhoLeft.clientIds.forEach((socketId) => {
            this.server.sockets.get(socketId).leave(roomId);
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("user:toggle-typing")
    async handleTyping(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() typingInfo: Omit<TToggleUserTyping, "userId">
    ) {
        const userPayload = client.user;
        void this.toggleTypingStatus({
            userId: userPayload.id,
            ...typingInfo,
        });
    }

    async toggleTypingStatus({
        userId: senderUserId,
        roomId,
        isTyping,
    }: TToggleUserTyping) {
        try {
            await this.userService.updateTypingStatus({
                userId: senderUserId,
                isTyping,
                roomId,
            });

            const participants = await this.participantService.findMany({
                where: {
                    roomId: roomId,
                },
                include: {
                    user: {
                        include: {
                            userOnline: true,
                            userTyping: true,
                        },
                    },
                },
            });

            const normalizedParticipants = participants.map(
                this.participantService.normalize
            );

            this.server
                .to(roomId)
                .except(senderUserId)
                .emit("room:toggle-typing", normalizedParticipants);
        } catch (error) {
            console.warn("error: ", error);
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:read")
    async handleReadMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() data
    ) {
        const senderPayload = client.user;

        const sender = await this.userService.findOne({
            id: senderPayload.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const readMessageInfo = (await this.messageService.findOne({
            where: {
                id: data.messageId,
                room: {
                    participants: {
                        some: {
                            userId: sender.id,
                            isStillMember: true,
                        },
                    },
                },
                senderId: {
                    not: sender.id,
                },
                hasRead: false,
            },
            include: {
                room: true,
            },
        })) as Prisma.MessageGetPayload<{ include: { room: true } }>;

        if (!readMessageInfo) {
            throw new WsException("Не найдено сообщение");
        }

        await this.messageService.update({
            where: {
                id: readMessageInfo.id,
            },
            data: {
                hasRead: true,
            },
        });

        this.server.to(readMessageInfo.roomId).emit("message:read", {
            roomId: readMessageInfo.roomId,
            message: {
                id: readMessageInfo.id,
                date: DATE_FORMATTER_DATE.format(
                    new Date(readMessageInfo.createdAt)
                ),
            },
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:pin")
    async handlePinMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: TPinMessage
    ) {
        const senderPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const targetMessage = await this.messageService.findOne({
            where: {
                id: message.messageId,
                AND: {
                    room: {
                        participants: {
                            some: {
                                userId: sender.id,
                                isStillMember: true,
                            },
                        },
                    },
                    pinnedMessages: null,
                },
            },
        });
        if (!targetMessage) {
            throw new WsException("Не найдено целевое сообщение");
        }

        const pinnedMessage = (await this.messageService.update({
            where: {
                id: message.messageId,
            },
            data: {
                pinnedMessages: {
                    create: {
                        roomId: targetMessage.roomId,
                    },
                },
            },
            include: {
                room: {
                    include: {
                        pinnedMessages: {
                            include: {
                                message: true,
                            },
                        },
                    },
                },
            },
        })) as Prisma.MessageGetPayload<{
            include: {
                room: {
                    include: {
                        pinnedMessages: {
                            include: {
                                message: true;
                            };
                        };
                    };
                };
            };
        }>;

        const responseInfo: TPinnedMessagesByRoom = {
            roomId: pinnedMessage.roomId,
            messages: pinnedMessage.room.pinnedMessages.map((pinnedMessage) => {
                return {
                    pinDate: DATE_FORMATTER_DATE.format(
                        new Date(pinnedMessage.createdAt)
                    ),
                    message: {
                        id: pinnedMessage.message.id,
                        date: DATE_FORMATTER_DATE.format(
                            new Date(pinnedMessage.message.createdAt)
                        ),
                    },
                };
            }),
        };

        this.server
            .to(pinnedMessage.roomId)
            .emit("message:pinned", responseInfo);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:unpin")
    async handleUnpinMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: TUnpinMessage
    ) {
        const senderPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const targetPinnedMessage = await this.messageService.findOnePinned({
            where: {
                messageId: message.messageId,
                AND: {
                    room: {
                        participants: {
                            some: {
                                userId: sender.id,
                                isStillMember: true,
                            },
                        },
                    },
                },
            },
        });
        if (!targetPinnedMessage) {
            throw new WsException("Не найдено целевое сообщение");
        }

        await this.messageService.update({
            where: {
                id: targetPinnedMessage.messageId,
            },
            data: {
                pinnedMessages: {
                    delete: {
                        messageId: targetPinnedMessage.messageId,
                    },
                },
            },
        });

        const responseInfo: TUnpinnedMessage = {
            roomId: targetPinnedMessage.roomId,
            messageId: targetPinnedMessage.messageId,
        };

        this.server
            .to(targetPinnedMessage.roomId)
            .emit("message:unpinned", responseInfo);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:delete")
    async handleDeleteMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: TDeleteMessage
    ) {
        // todo
        //  if this one shouldn't be delete for everyone -
        //      check if there are users who have deleted this message.
        //          And if every user deleted this message - clear all data about this one.
        const senderPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const deleteMessageQuery: Prisma.MessageUpdateInput =
            message.isForEveryone
                ? {
                      isDeleteForEveryone: true,
                  }
                : {
                      userDeletedThisMessage: {
                          create: {
                              user: {
                                  connect: {
                                      id: sender.id,
                                  },
                              },
                          },
                      },
                  };
        const deletedMessage = (await this.messageService.update({
            where: {
                id: message.messageId,
            },
            data: deleteMessageQuery,
            include: {
                repliesThisMessage: true,
                forwardThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: {
                repliesThisMessage: true;
                forwardThisMessage: true;
            };
        }>;

        const dependentMessageIds = [
            ...deletedMessage.repliesThisMessage.map((replyThisMessage) => {
                return {
                    id: replyThisMessage.id,
                    date: DATE_FORMATTER_DATE.format(
                        new Date(replyThisMessage.createdAt)
                    ),
                };
            }),
            ...deletedMessage.forwardThisMessage.map((forwardThisMessage) => {
                return {
                    id: forwardThisMessage.id,
                    date: DATE_FORMATTER_DATE.format(
                        new Date(forwardThisMessage.createdAt)
                    ),
                };
            }),
        ];
        const editedMessageInfo = {
            roomId: deletedMessage.roomId,
            message: {
                id: deletedMessage.id,
                date: DATE_FORMATTER_DATE.format(
                    new Date(deletedMessage.createdAt)
                ),
            },
            dependentMessages: dependentMessageIds,
            isDeleted: true,
        };
        if (!message.isForEveryone) {
            client.emit("message:deleted", editedMessageInfo);
        } else {
            this.server
                .to(deletedMessage.roomId)
                .emit("message:deleted", editedMessageInfo);
            if (
                deletedMessage.repliesThisMessage.length === 0 &&
                deletedMessage.forwardThisMessage.length === 0
            ) {
                // delete the message there no references to this one in other messages
                void this.messageService.delete({
                    id: deletedMessage.id,
                });
            }
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:edit")
    async handleEditMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: TNewEditedMessage
    ) {
        const senderPayloadJWT = client.user;

        if (message.text && message.text.length > 0) {
            message.text = brToNewLineChars(message.text).trim();
            if (message.text.length === 0) {
                return;
            }
        }

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const updatedMessage = (await this.messageService.update({
            where: {
                id: message.messageId,
            },
            data: {
                text: message.text,
                updatedAt: new Date(),
            },
            include: {
                repliesThisMessage: true,
                forwardThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: {
                repliesThisMessage: true;
                forwardThisMessage: true;
            };
        }>;
        if (!updatedMessage || updatedMessage.senderId !== sender.id) {
            throw new WsException(
                "Сообщение либо не существует, либо вы пытаетесь изменить не свое сообщение"
            );
        }

        const dependentMessageIds = [
            ...updatedMessage.repliesThisMessage.map((replyThisMessage) => {
                return {
                    id: replyThisMessage.id,
                    date: DATE_FORMATTER_DATE.format(
                        new Date(replyThisMessage.createdAt)
                    ),
                };
            }),
            ...updatedMessage.forwardThisMessage.map((forwardThisMessage) => {
                return {
                    id: forwardThisMessage.id,
                    date: DATE_FORMATTER_DATE.format(
                        new Date(forwardThisMessage.createdAt)
                    ),
                };
            }),
        ];

        const editedMessageInfo = {
            roomId: updatedMessage.roomId,
            message: {
                id: message.messageId,
                text: codeBlocksToHTML(message.text),
                date: DATE_FORMATTER_DATE.format(
                    new Date(updatedMessage.createdAt)
                ),
                updatedAt: updatedMessage.updatedAt,
            },
            dependentMessages: dependentMessageIds,
        };

        this.server
            .to(editedMessageInfo.roomId)
            .emit("message:edited", editedMessageInfo);
    }

    @UseGuards(WsAuthGuard)
    @UseFilters(new WsExceptionFilter())
    @SubscribeMessage("message:forward")
    async handleForwardMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: TNewForwardedMessage
    ) {
        const senderPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const room = await this.roomService.findOne({
            where: { id: message.roomId },
        });
        if (!room) {
            throw new WsException("Комната не найдена");
        }

        const forwardedMessage = await this.messageService.findOne({
            where: {
                id: message.forwardedMessageId,
            },
        });
        if (!forwardedMessage) {
            throw new WsException("Пересылаемое сообщение не существует");
        }

        const newMessage = (await this.messageService.create({
            data: {
                sender: {
                    connect: {
                        id: sender.id,
                    },
                },
                room: {
                    connect: {
                        id: room.id,
                    },
                },
                forwardedMessage: {
                    connect: {
                        id: message.forwardedMessageId,
                    },
                },
            },
            include: ForwardedMessagePrisma,
        })) as Prisma.MessageGetPayload<{
            include: typeof ForwardedMessagePrisma;
        }>;

        const normalizedMessage = await this.messageService.normalize(
            sender.id,
            newMessage
        );

        const normalizedForwardedMessage = await this.messageService.normalize(
            sender.id,
            newMessage.forwardedMessage
        );

        if (!isInnerForwardedMessage(normalizedMessage)) {
            throw new WsException("Что-то пошло не так.");
        }

        this.server.to(normalizedMessage.roomId).emit("message:forwarded", {
            message: normalizedMessage,
            forwardedMessage: normalizedForwardedMessage,
            date: DATE_FORMATTER_DATE.format(
                new Date(normalizedMessage.createdAt)
            ),
        });
    }

    @UseGuards(WsAuthGuard)
    @UseFilters(new WsExceptionFilter())
    @UsePipes(new ValidationPipe())
    @SubscribeMessage("message:standard")
    async handleMessage(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() message: MessageDto
    ) {
        const senderPayloadJWT = client.user;

        message.text = brToNewLineChars(message.text).trim();
        if (!message.text && !message.attachmentIds.length) {
            throw new WsException("Вы отправили пустое сообщение");
        }

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const room = await this.roomService.findOne({
            where: { id: message.roomId },
        });
        if (!room) {
            throw new WsException("Комната не найдена");
        }

        void this.toggleTypingStatus({
            userId: sender.id,
            roomId: room.id,
            isTyping: false,
        });

        const messageBeingProcessedInfo =
            (await this.messageService.findOneProcessed({
                where: {
                    senderId_roomId: {
                        senderId: sender.id,
                        roomId: room.id,
                    },
                },
                include: {
                    files: true,
                },
            })) as Prisma.MessageBeingProcessedGetPayload<{
                include: {
                    files: true;
                };
            }>;

        const infoAttachments: Array<
            Omit<FileProcessedMessages, "id" | "messageBeingProcessedId">
        > = [];
        if (messageBeingProcessedInfo) {
            messageBeingProcessedInfo.files.forEach((fileInfo) => {
                const redactedFileInfo = excludeSensitiveFields(fileInfo, [
                    "id",
                    "messageBeingProcessedId",
                ]);

                infoAttachments.push(redactedFileInfo);
            });

            void this.messageService.deleteProcessed({
                senderId_roomId: {
                    senderId: sender.id,
                    roomId: room.id,
                },
            });
        }

        const replyConnect: Pick<
            Prisma.MessageCreateInput,
            "replyToMessage"
        > | null = message.replyToMessageId
            ? {
                  replyToMessage: {
                      connect: {
                          id: message.replyToMessageId,
                      },
                  },
              }
            : null;

        const filesCreateMany: Pick<Prisma.MessageCreateInput, "files"> | null =
            infoAttachments.length > 0
                ? {
                      files: {
                          createMany: {
                              data: infoAttachments,
                          },
                      },
                  }
                : null;

        const newMessage = (await this.messageService.create({
            data: {
                sender: {
                    connect: {
                        id: sender.id,
                    },
                },
                room: {
                    connect: {
                        id: room.id,
                    },
                },
                text: message.text,
                ...replyConnect,
                ...filesCreateMany,
            },
            include: {
                room: true,
                files: true,
                replyToMessage: {
                    include: {
                        files: true,
                        userDeletedThisMessage: true,
                    },
                },
                userDeletedThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: {
                files: true;
                replyToMessage: {
                    include: {
                        files: true;
                        userDeletedThisMessage: true;
                    };
                };
                userDeletedThisMessage: true;
            };
        }>;
        const normalizedMessage = await this.messageService.normalize(
            sender.id,
            newMessage
        );

        if (isInnerForwardedMessage(normalizedMessage)) {
            throw new WsException("Что-то пошло не по плану");
        }

        this.server.to(message.roomId).emit("message:standard", {
            message: normalizedMessage,
            date: DATE_FORMATTER_DATE.format(
                new Date(normalizedMessage.createdAt)
            ),
        });
    }

    // WebRTC
    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:join")
    async webrtcJoin(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() { roomId }: IInitCall
    ) {
        console.log("join");
        const clients =
            this.socketRoomsInfo.getUserIdsWithSocketIdsByRoomId(roomId);

        console.log("clients: ", clients);
        for (const [userId, socketIds] of Object.entries(clients)) {
            if (socketIds.has(client.id)) {
                continue;
            }

            // todo: send call request to the all of the client's socket ids and then leave one which accepted the call
            this.server.to(Array.from(socketIds)).emit("webrtc:add-peer", {
                peerId: client.id,
                shouldCreateOffer: false,
            });

            console.log(" client for offer: ", {
                userId: userId,
                socketId: Array.from(socketIds),
            });
            client.emit("webrtc:add-peer", {
                peerId: Array.from(socketIds),
                shouldCreateOffer: true,
            });
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:relay-sdp")
    async webrtcRelaySdp(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() { peerId, sessionDescription }: IRelaySdp
    ) {
        console.log("relay-sdp: ", {
            peerId,
            sessionDescriptionType: sessionDescription.type,
        });
        this.server.to(peerId).emit("webrtc:session-description", {
            peerId: client.id, // todo have to find peerId and its interlocutor
            sessionDescription,
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:relay-ice")
    async webrtcRelayIce(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() { peerId, iceCandidate }: IRelayIce
    ) {
        this.server.to(peerId).emit("webrtc:relay-ice", {
            peerID: client.id,
            iceCandidate,
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:leave")
    async webrtcLeave(
        @ConnectedSocket() client: TSocketWithPayload,
        @MessageBody() { roomId }: ILeaveCall
    ) {
        const memberInformation =
            this.socketRoomsInfo.getUserIdsWithSocketIdsByRoomId(roomId);
        for (const [, socketIds] of Object.entries(memberInformation)) {
            this.server.to(Array.from(socketIds)).emit("webrtc:remove-peer", {
                peerId: client.id,
            });

            client.emit("webrtc:remove-peer", {
                peerId: Array.from(socketIds),
            });
        }
    }
}
