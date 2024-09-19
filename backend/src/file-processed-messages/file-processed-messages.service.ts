import { Injectable } from "@nestjs/common";
import {
    FileProcessedMessages,
    FileType,
    MessageBeingProcessed,
    Prisma,
} from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { S3Service } from "../s3/s3.service";

@Injectable()
export class FileProcessedMessagesService {
    constructor(
        private readonly prisma: DatabaseService,
        private s3Service: S3Service
    ) {}

    async create(
        senderId: string,
        roomId: string,
        file: Express.Multer.File,
        fileType: FileType
    ): Promise<FileProcessedMessages> {
        const path = this.s3Service.generateFilePath({
            senderId,
            originalName: file.originalname,
        });

        return this.prisma.fileProcessedMessages.create({
            data: {
                path: path,
                mimeType: file.mimetype,
                originalName: file.originalname,
                fileType: fileType,
                size: file.size,
                messageBeingProcessed: {
                    connectOrCreate: {
                        where: {
                            senderId_roomId: {
                                senderId,
                                roomId,
                            },
                        },
                        create: {
                            senderId,
                            roomId,
                        },
                    },
                },
            },
        });
    }

    async delete(
        senderId: string,
        roomId: string,
        fileId: string
    ): Promise<FileProcessedMessages> {
        const deletedFileInfo = (await this.prisma.fileProcessedMessages.delete(
            {
                where: {
                    id: fileId,
                    AND: [
                        {
                            messageBeingProcessed: {
                                roomId: roomId,
                                senderId: senderId,
                            },
                        },
                    ],
                },
                include: {
                    messageBeingProcessed: {
                        include: {
                            files: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            }
        )) as Prisma.FileProcessedMessagesGetPayload<{
            include: {
                messageBeingProcessed: {
                    include: {
                        files: {
                            select: {
                                id: true;
                            };
                        };
                    };
                };
            };
        }>;

        if (
            !deletedFileInfo.messageBeingProcessed.text &&
            deletedFileInfo.messageBeingProcessed.files.length === 1 &&
            deletedFileInfo.messageBeingProcessed.files[0].id === fileId
        ) {
            await this.prisma.messageBeingProcessed.delete({
                where: {
                    id: deletedFileInfo.messageBeingProcessed.id,
                },
            });
        }

        return excludeSensitiveFields(deletedFileInfo, [
            "messageBeingProcessed",
        ]);
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.MessageBeingProcessedWhereUniqueInput;
        where?: Prisma.MessageBeingProcessedWhereInput;
        orderBy?: Prisma.MessageBeingProcessedOrderByWithRelationInput;
    }): Promise<MessageBeingProcessed[]> {
        const { skip, take, cursor, where, orderBy } = params;

        return this.prisma.messageBeingProcessed.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }
}
