import { Injectable } from "@nestjs/common";
import { MessageBeingProcessed, Prisma, PrismaPromise } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import {
    MessageAction,
    MessageBeingProcessedPrisma,
    TMessageForActionWithDate,
    TNormalizedRecentMessageInput,
} from "../message/message.model";
import { FileService } from "../file/file.service";
import { RecentMessageDto } from "../message/message.dto";
import { DATE_FORMATTER_DATE } from "../utils/normalizeDate";

@Injectable()
export class MessageBeingProcessedService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly fileService: FileService
    ) {}

    async getFullProcessedMessageInfo({
        userId,
        roomId,
    }: {
        userId: string;
        roomId: string;
    }): Promise<TNormalizedRecentMessageInput> {
        const result = await this.prisma.messageBeingProcessed.findUnique({
            where: {
                senderId_roomId: {
                    roomId,
                    senderId: userId,
                },
            },
            include: {
                files: true,
                replyToMessage: true,
                editMessage: true,
            },
        });

        if (!result) {
            return {
                roomId,
                text: null,
                messageForAction: null,
                uploadedFiles: [],
            };
        }

        return this.normalize(result);
    }

    async upsert({ userId, ...data }: RecentMessageDto & { userId: string }) {
        let messageForActionCreate:
            | Pick<Prisma.MessageBeingProcessedCreateInput, "replyToMessage">
            | Pick<Prisma.MessageBeingProcessedCreateInput, "editMessage">
            | null = null;
        if (
            data.messageForAction &&
            data.messageForAction.action === MessageAction.REPLY
        ) {
            messageForActionCreate = {
                replyToMessage: {
                    connect: {
                        id: data.messageForAction.id,
                    },
                },
            };
        } else if (
            data.messageForAction &&
            data.messageForAction.action === MessageAction.EDIT
        ) {
            messageForActionCreate = {
                editMessage: {
                    connect: {
                        id: data.messageForAction.id,
                    },
                },
            };
        }

        /*
         * we have to do one more query to reset reply and edited messages info.
         * */
        await this.prisma.messageBeingProcessed.upsert({
            where: {
                senderId_roomId: {
                    senderId: userId,
                    roomId: data.roomId,
                },
            },
            update: {
                replyToMessage: {
                    disconnect: true,
                },
                editMessage: {
                    disconnect: true,
                },
            },
            create: {
                room: {
                    connect: {
                        id: data.roomId,
                    },
                },
                sender: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        return this.prisma.messageBeingProcessed.upsert({
            where: {
                senderId_roomId: {
                    senderId: userId,
                    roomId: data.roomId,
                },
                room: {
                    participants: {
                        some: {
                            userId,
                            isStillMember: true,
                        },
                    },
                },
            },
            update: {
                text: data.text,
                ...messageForActionCreate,
            },
            create: {
                room: {
                    connect: {
                        id: data.roomId,
                    },
                },
                sender: {
                    connect: {
                        id: userId,
                    },
                },
                text: data.text,
                ...messageForActionCreate,
            },
        });
    }

    async findOne<T extends Prisma.MessageBeingProcessedInclude>(params: {
        where: Prisma.MessageBeingProcessedWhereUniqueInput;
        include?: T;
    }): Promise<
        | MessageBeingProcessed
        | Prisma.MessageBeingProcessedGetPayload<{ include: T }>
        | null
    > {
        const { where, include } = params;

        return this.prisma.messageBeingProcessed.findUnique({
            where,
            include,
        });
    }
    async findMany<T extends Prisma.MessageBeingProcessedInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.MessageBeingProcessedWhereUniqueInput;
        where?: Prisma.MessageBeingProcessedWhereInput;
        orderBy?: Prisma.MessageBeingProcessedOrderByWithRelationInput;
        include?: T;
    }): Promise<
        | Prisma.MessageBeingProcessedGetPayload<{ include: T }>[]
        | MessageBeingProcessed[]
    > {
        const { where, include } = params;

        return this.prisma.messageBeingProcessed.findMany({
            where,
            include,
        });
    }

    async delete(params: {
        where: Prisma.MessageBeingProcessedWhereUniqueInput;
    }): Promise<MessageBeingProcessed> {
        return this.prisma.messageBeingProcessed.delete(params);
    }

    async deleteMany(
        where: Prisma.MessageBeingProcessedWhereInput
    ): Promise<PrismaPromise<Prisma.BatchPayload>> {
        return this.prisma.messageBeingProcessed.deleteMany({
            where,
        });
    }

    normalize(
        inputMessagePrisma: Prisma.MessageBeingProcessedGetPayload<{
            include: typeof MessageBeingProcessedPrisma;
        }>
    ): TNormalizedRecentMessageInput {
        let messageForAction: TMessageForActionWithDate | null = null;

        if (inputMessagePrisma.replyToMessageId) {
            messageForAction = {
                action: MessageAction.REPLY,
                message: {
                    id: inputMessagePrisma.replyToMessageId,
                    createdAt: DATE_FORMATTER_DATE.format(
                        new Date(inputMessagePrisma.replyToMessage.createdAt)
                    ),
                },
            };
        } else if (inputMessagePrisma.editMessageId) {
            messageForAction = {
                action: MessageAction.EDIT,
                message: {
                    id: inputMessagePrisma.editMessageId,
                    createdAt: DATE_FORMATTER_DATE.format(
                        new Date(inputMessagePrisma.editMessage.createdAt)
                    ),
                },
            };
        }

        if (inputMessagePrisma)
            return {
                roomId: inputMessagePrisma.roomId,
                text: inputMessagePrisma.text,
                messageForAction: messageForAction,
                uploadedFiles: this.fileService.normalizeFiles(
                    inputMessagePrisma.files as any[]
                ),
            };
    }
}
