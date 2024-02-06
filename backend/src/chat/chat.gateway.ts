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
import { UseGuards } from "@nestjs/common";
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
} from "./IChat";
import { Prisma, File } from "@prisma/client";
import { PrismaIncludeFullRoomInfo } from "../room/IRooms";
import { ForwardedMessagePrisma } from "../message/IMessage";

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
        private readonly participantService: ParticipantService
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
            this.socketRoomsInfo.join(room.id, userInfo.id, client.id);
            client.join(room.id);

            client.broadcast.to(room.id).emit("user:toggle-online", userOnline);
        });
    }

    async handleDisconnect(@ConnectedSocket() client) {
        const userToRoomInfo = this.socketRoomsInfo.leave(client.id);
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
            messageId: readMessageInfo.id,
            roomId: readMessageInfo.roomId,
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
                      usersDeletedThisMessage: {
                          connect: {
                              id: sender.id,
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
            ...deletedMessage.repliesThisMessage.map(
                (replyThisMessage) => replyThisMessage.id
            ),
            ...deletedMessage.forwardThisMessage.map(
                (forwardThisMessage) => forwardThisMessage.id
            ),
        ];
        const editedMessageInfo = {
            roomId: deletedMessage.roomId,
            messageId: deletedMessage.id,
            dependentMessageIds: dependentMessageIds,
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

        const updatedMessage = await this.messageService.update({
            where: {
                id: message.messageId,
            },
            data: {
                text: message.text,
                updatedAt: new Date(),
            },
        });
        if (!updatedMessage || updatedMessage.senderId !== sender.id) {
            throw new WsException(
                "Сообщение либо не существует, либо вы пытаетесь изменить не свое сообщение"
            );
        }

        const editedMessageInfo = {
            roomId: updatedMessage.roomId,
            messageId: message.messageId,
            text: codeBlocksToHTML(message.text),
            updatedAt: updatedMessage.updatedAt,
        };

        this.server
            .to(editedMessageInfo.roomId)
            .emit("message:edited", editedMessageInfo);
    }

    @UseGuards(WsAuthGuard)
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
                                usersDeletedThisMessage: true,
                            },
                        },
                        usersDeletedThisMessage: true,
                    },
                },
                usersDeletedThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: typeof ForwardedMessagePrisma;
        }>;
        const normalizedMessage = await this.messageService.normalize(
            sender.id,
            newMessage
        );

        this.server
            .to(forwardedMessage.roomId)
            .emit("message:forwarded", normalizedMessage);
    }

    @UseGuards(WsAuthGuard)
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
                        usersDeletedThisMessage: true,
                    },
                },
                usersDeletedThisMessage: true,
            },
        })) as Prisma.MessageGetPayload<{
            include: {
                files: true;
                replyToMessage: {
                    include: {
                        files: true;
                        usersDeletedThisMessage: true;
                    };
                };
                usersDeletedThisMessage: true;
            };
        }>;
        const normalizedMessage = await this.messageService.normalize(
            sender.id,
            newMessage
        );

        this.server
            .to(message.roomId)
            .emit("message:standard", normalizedMessage);
    }
}
