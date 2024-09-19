import { Injectable } from "@nestjs/common";
import { MessageBeingProcessed, Prisma, PrismaPromise } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { IRecentMessageInput, MessageAction } from "../message/message.model";
import { FileService } from "../file/file.service";
import { RecentMessageDto } from "../message/message.dto";

@Injectable()
export class MessageBeingProcessedService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly fileService: FileService
    ) {}

    async upsert({ userId, ...data }: RecentMessageDto & { userId: string }) {
        const replyToMessageQuery: Pick<
            Prisma.MessageBeingProcessedCreateInput,
            "replyToMessage"
        > | null =
            data.messageForAction &&
            data.messageForAction.action === MessageAction.REPLY
                ? {
                      replyToMessage: {
                          connect: {
                              id: data.messageForAction.id,
                          },
                      },
                  }
                : null;

        const editMessageQuery: Pick<
            Prisma.MessageBeingProcessedCreateInput,
            "editMessage"
        > | null =
            data.messageForAction &&
            data.messageForAction.action === MessageAction.EDIT
                ? {
                      editMessage: {
                          connect: {
                              id: data.messageForAction.id,
                          },
                      },
                  }
                : null;

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
                ...replyToMessageQuery,
                ...editMessageQuery,
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
                ...replyToMessageQuery,
                ...editMessageQuery,
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

    async delete(
        where: Prisma.MessageBeingProcessedWhereUniqueInput
    ): Promise<MessageBeingProcessed> {
        return this.prisma.messageBeingProcessed.delete({
            where,
        });
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
            include: {
                files: true;
            };
        }>
    ): IRecentMessageInput {
        return {
            text: inputMessagePrisma.text,
            files: this.fileService.normalizeFiles(
                inputMessagePrisma.files as any[]
            ),
        };
    }
}
