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
import { UseFilters, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import * as mime from "mime-types";
// own modules
import { WsAuthGuard } from "../auth/ws-auth.guard";
import { UserService } from "../user/user.service";
import { AuthService } from "../auth/auth.service";
import { MessageService } from "../message/message.service";
import { RoomService } from "../room/room.service";
import { ParticipantService } from "../participant/participant.service";
import { FileService } from "../file/file.service";
import { SocketRoomsInfo } from "./SocketRoomsInfo.class";
import { generateFileName } from "../utils/generateFileName";
import { brToNewLineChars } from "../utils/brToNewLineChars ";
import { checkIsFulfilledPromise } from "../utils/checkIsFulfilledPromise";
import { codeBlocksToHTML } from "../utils/codeBlocksToHTML";
// types
import { IUserSessionPayload } from "../user/IUser";
import {
    TNewMessage,
    TToggleUserTyping,
    TNewForwardedMessage,
    TNewEditedMessage,
    TDeleteMessage,
    TReadMessage,
    TPinMessage,
} from "./chat.models";
import { Prisma, File } from "@prisma/client";
import { PrismaIncludeFullRoomInfo } from "../room/IRooms";
import { ForwardedMessagePrisma } from "../message/IMessage";
import { DATE_FORMATTER_DATE } from "../utils/normalizeDate";
import { RoomsOnFoldersService } from "../rooms-on-folders/rooms-on-folders.service";
import { WsExceptionFilter } from "../exceptions/ws-exception.filter";
import { IInitCall, ILeaveCall, IRelayIce, IRelaySdp } from "./webrtc.models";

@WebSocketGateway({
    namespace: "api/chat",
    cors: {
        origin: "*",
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    socketRoomsInfo: SocketRoomsInfo;

    constructor(
        private readonly roomService: RoomService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService,
        private readonly messageService: MessageService,
        private readonly participantService: ParticipantService,
        private readonly roomOnFoldersService: RoomsOnFoldersService
    ) {
        this.socketRoomsInfo = new SocketRoomsInfo();
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        const userInfo = await this.authService.verify(
            client.handshake.headers.sessionid as string
        );
        this.socketRoomsInfo.initConnection(userInfo.id, client.id);

        const userRooms = await this.roomService.findMany({
            where: {
                participants: {
                    some: {
                        userId: {
                            equals: userInfo.id,
                        },
                    },
                },
            },
        });

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userInfo.id,
            isOnline: true,
        });

        userRooms.forEach((room) => {
            this.socketRoomsInfo.join(room.id, userInfo.id);
            client.join(room.id);

            client.broadcast.to(room.id).emit("user:toggle-online", userOnline);
        });
    }

    async handleDisconnect(@ConnectedSocket() client) {
        const userToRoomInfo = this.socketRoomsInfo.leaveAll(client.id);
        if (!userToRoomInfo) {
            return;
        }
        const { userId, roomIDs } = userToRoomInfo;

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userId,
            isOnline: false,
        });

        roomIDs.forEach((roomId) => {
            client.broadcast.to(roomId).emit("user:toggle-online", userOnline);
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("room:join-or-create")
    async joinNewRoom(
        @ConnectedSocket() client,
        @MessageBody() roomData: { id: string }
    ) {
        const userPayload: IUserSessionPayload = client.user;

        const unnormalizedRoom = (await this.roomService.findOne({
            where: {
                id: roomData.id,
            },
            include: PrismaIncludeFullRoomInfo,
        })) as Prisma.RoomGetPayload<{
            include: typeof PrismaIncludeFullRoomInfo;
        }>;

        unnormalizedRoom.participants.forEach((participant) => {
            // the participant maybe didn't connect to the new room.
            const participantClientId = this.socketRoomsInfo.joinIfConnected(
                unnormalizedRoom.id,
                participant.userId
            );
            const participantSocket =
                // @ts-ignore
                this.server.sockets.get(participantClientId);

            if (participantSocket) {
                // participant is online - we have to manually join this one to the room.
                participantSocket.join(unnormalizedRoom.id);
            }
        });

        unnormalizedRoom.participants.forEach((participant) => {
            const userIdToSocketId = Object.entries(
                this.socketRoomsInfo.getRoomInfo(unnormalizedRoom.id)
            ).find(
                ([userId, socketId]) =>
                    participant.userId === userId && socketId !== client.id
            );

            if (!userIdToSocketId) return;
            const [userId, clientId] = userIdToSocketId;

            this.roomService
                .normalize(userId, unnormalizedRoom)
                .then((room) => {
                    client.broadcast
                        .to(room.id)
                        .emit("room:add-or-update", room);
                });
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("room:leave")
    async leaveRoom(
        @ConnectedSocket() client,
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
            await this.roomOnFoldersService.findMany({
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
            void this.roomOnFoldersService.removeRoomFromFolder({
                where: {
                    folderId_roomId: {
                        roomId: roomId,
                        folderId: folder.id,
                    },
                },
            });
        });

        const userWhoLeft = this.socketRoomsInfo.leaveOne(client.id, roomId);
        client.leave(roomId);

        this.server
            .to(roomId)
            .emit("room:left", { roomId, userId: userWhoLeft.userId });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("user:toggle-typing")
    async handleTyping(
        @ConnectedSocket() client,
        @MessageBody() typingInfo: Omit<TToggleUserTyping, "userId">
    ) {
        const userPayload: IUserSessionPayload = client.user;
        void this.toggleTypingStatus(client, {
            userId: userPayload.id,
            ...typingInfo,
        });
    }

    async toggleTypingStatus(
        client,
        { userId, roomId, isTyping }: TToggleUserTyping
    ) {
        try {
            await this.userService.updateTypingStatus({
                userId,
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
            normalizedParticipants.forEach((participant) => {
                const userIdToSocketId = Object.entries(
                    this.socketRoomsInfo.getRoomInfo(roomId)
                ).find(
                    ([userId, socketId]) =>
                        participant.userId === userId && socketId !== client.id
                );

                if (!userIdToSocketId) return;
                const [userId, clientId] = userIdToSocketId;
                const excludingThisUserTypingInfo =
                    normalizedParticipants.filter(
                        (participant) => participant.userId !== userId
                    );

                client.broadcast
                    .to(clientId)
                    .emit("room:toggle-typing", excludingThisUserTypingInfo);
            });
        } catch (error) {
            console.warn("error: ", error);
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:read")
    async handleReadMessage(
        @ConnectedSocket() client,
        @MessageBody() data: TReadMessage
    ) {
        const senderPayload: IUserSessionPayload = client.user;

        const sender = await this.userService.findOne({
            id: senderPayload.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const readMessageInfo = (await this.messageService.findOne({
            where: {
                id: data.messageId,
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
        @ConnectedSocket() client,
        @MessageBody() message: TPinMessage
    ) {
        const senderPayloadJWT: IUserSessionPayload = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const pinnedMessage = (await this.messageService.update({
            where: {
                id: message.messageId,
            },
            data: {
                pinnedMessages: {
                    create: {
                        roomId: message.roomId,
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

        const responseInfo = {
            roomId: pinnedMessage.roomId,
            messages: pinnedMessage.room.pinnedMessages.map((pinnedMessage) => {
                return {
                    id: pinnedMessage.id,
                    text: pinnedMessage.message.text,
                    messageId: pinnedMessage.message.id,
                };
            }),
        };

        this.server
            .to(pinnedMessage.roomId)
            .emit("message:pinned", responseInfo);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("message:delete")
    async handleDeleteMessage(
        @ConnectedSocket() client,
        @MessageBody() message: TDeleteMessage
    ) {
        // todo
        //  if this one shouldn't be delete for everyone -
        //      check if there are users who have deleted this message.
        //          And if every user deleted this message - clear all data about this one.
        const senderPayloadJWT: IUserSessionPayload = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id,
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const deletedMessageQuery: Prisma.MessageUpdateInput =
            message.isForEveryone
                ? { isDeleteForEveryone: true }
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
            data: deletedMessageQuery,
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
        @ConnectedSocket() client,
        @MessageBody() message: TNewEditedMessage
    ) {
        const senderPayloadJWT: IUserSessionPayload = client.user;

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
        @ConnectedSocket() client,
        @MessageBody() message: TNewForwardedMessage
    ) {
        const senderPayloadJWT: IUserSessionPayload = client.user;

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
            include: {
                forwardedMessage: {
                    include: {
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true,
                                userDeletedThisMessage: true,
                            },
                        },
                        userDeletedThisMessage: true,
                    },
                },
                userDeletedThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: typeof ForwardedMessagePrisma;
        }>;
        const normalizedMessage = await this.messageService.normalize(
            sender.id,
            newMessage
        );

        this.server.to(forwardedMessage.roomId).emit("message:forwarded", {
            message: normalizedMessage,
            date: DATE_FORMATTER_DATE.format(
                new Date(normalizedMessage.createdAt)
            ),
        });
    }

    @UseGuards(WsAuthGuard)
    @UseFilters(new WsExceptionFilter())
    @SubscribeMessage("message:standard")
    async handleMessage(
        @ConnectedSocket() client,
        @MessageBody() message: TNewMessage
    ) {
        const senderPayloadJWT: IUserSessionPayload = client.user;

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

        const room = await this.roomService.findOne({
            where: { id: message.roomId },
        });
        if (!room) {
            throw new WsException("Комната не найдена");
        }

        void this.toggleTypingStatus(client, {
            userId: sender.id,
            roomId: room.id,
            isTyping: false,
        });

        const attachmentPromises = message.attachments.map<
            Promise<Omit<File, "id" | "messageId" | "createdAt">>
        >(async (value, index) => {
            let extension: string;
            if (value.extension.length > 0) {
                extension = value.extension;
            } else {
                extension =
                    mime.extension(value.mimeType) ||
                    value.mimeType.concat("/")[1];
            }
            const fileName = generateFileName(
                sender.id,
                value.fileType,
                extension,
                index
            );

            return new Promise(async (resolve, reject) => {
                this.fileService
                    .write(value.buffer, fileName)
                    .then(() => {
                        resolve({
                            fileName: fileName,
                            originalName: value.originalName,
                            fileType: value.fileType,
                            mimeType: value.mimeType,
                            extension: extension,
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        });
        const attachmentPromisesResults = await Promise.allSettled(
            attachmentPromises
        );
        const successfullyRecordedAttachments = attachmentPromisesResults
            .filter((promiseResult) => checkIsFulfilledPromise(promiseResult)) // ???
            .map((succeededPromise) => {
                if (checkIsFulfilledPromise(succeededPromise)) {
                    // add one more check
                    return succeededPromise.value; // todo: repair the narrowing type in the filter.
                }
            });

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
                ...replyConnect,
                text: message.text,
                files: {
                    create: successfullyRecordedAttachments,
                },
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
        @ConnectedSocket() client,
        @MessageBody() { roomId }: IInitCall
    ) {
        console.log("join");
        const clients = this.socketRoomsInfo.getRoomInfo(roomId);

        console.log("clients: ", clients);
        for (const [userId, socketIds] of Object.entries(clients)) {
            if (socketIds.includes(client.id)) {
                continue;
            }

            // todo: send call request to the all of the client's socket ids and then leave one which accepted the call
            this.server.to(socketIds[0]).emit("webrtc:add-peer", {
                peerId: client.id,
                shouldCreateOffer: false,
            });

            console.log(" client for offer: ", {
                userId: userId,
                socketId: socketIds[0],
            });
            client.emit("webrtc:add-peer", {
                peerId: socketIds[0],
                shouldCreateOffer: true,
            });
        }
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:relay-sdp")
    async webrtcRelaySdp(
        @ConnectedSocket() client,
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
        @ConnectedSocket() client,
        @MessageBody() { peerId, iceCandidate }: IRelayIce
    ) {
        this.server.to(peerId).emit("webrtc:relay-ice", {
            peerId: client.id,
            iceCandidate,
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage("webrtc:leave")
    async webrtcLeave(
        @ConnectedSocket() client,
        @MessageBody() { roomId }: ILeaveCall
    ) {
        const clients = this.socketRoomsInfo.getRoomInfo(roomId);
        for (const [, socketIds] of Object.entries(clients)) {
            this.server.to(socketIds[0]).emit("webrtc:remove-peer", {
                peerId: client.id,
            });

            client.emit("webrtc:remove-peer", {
                peerId: socketIds[0],
            });
        }
    }
}
