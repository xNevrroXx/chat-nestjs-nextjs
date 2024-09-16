import * as fs from "fs";
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { AppConstantsService } from "../app.constants.service";
import {
    type File,
    FileProcessedMessages,
    FileType,
    MessageBeingProcessed,
    Prisma,
} from "@prisma/client";
import { TFileToClient } from "./file.model";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { byteSize } from "../utils/byteSize";
import { S3Service } from "../s3/s3.service";

@Injectable()
export class FileService {
    constructor(
        private prisma: DatabaseService,
        private constants: AppConstantsService,
        private s3Service: S3Service
    ) {
        if (!fs.existsSync(this.constants.USERS_DATA_FOLDER_PATH)) {
            fs.mkdirSync(this.constants.USERS_DATA_FOLDER_PATH);
        }
    }

    async createRecord(
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

    async deleteWaitedFile(
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

    async findOne(
        fileWhereUniqueInput: Prisma.FileWhereUniqueInput
    ): Promise<File | null> {
        return this.prisma.file.findUnique({
            where: fileWhereUniqueInput,
        });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.FileWhereUniqueInput;
        where?: Prisma.FileWhereInput;
        orderBy?: Prisma.FileOrderByWithRelationInput;
    }): Promise<File[]> {
        const { skip, take, cursor, where, orderBy } = params;

        return this.prisma.file.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async findManyWaited(params: {
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

    async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
        // todo delete from the disk
        return this.prisma.file.delete({
            where,
        });
    }

    normalizeFiles(files: File[]): TFileToClient[] {
        return files.map<TFileToClient>((file) => {
            const f = excludeSensitiveFields(file, [
                "path",
                "size",
            ]) as TFileToClient;

            f.url = file.path;
            f.size = byteSize({
                sizeInBytes: file.size,
            });
            return f;
        });
    }
}
