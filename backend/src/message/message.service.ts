import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { type Message, Prisma, User } from "@prisma/client";
import {
    IInnerForwardedMessage,
    IInnerMessage,
    TMessage,
    isForwardedMessagePrisma,
    isInnerForwardedMessage,
    isInnerMessage,
    IForwardedMessage,
    IStandardMessage,
    TNormalizeMessageArgument,
} from "./IMessage";
import { TFileToClient } from "../file/IFile";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { FileService } from "../file/file.service";
import { findLinksInText } from "../utils/findLinksInText";
import { LinkPreviewService } from "../link-preview/link-preview.service";
import { TValueOf } from "../models/TUtils";
import { normalizeDate } from "../utils/normalizeDate";
import { codeBlocksToHTML } from "../utils/codeBlocksToHTML";

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly fileService: FileService,
        private readonly linkPreviewService: LinkPreviewService
    ) {}

    async findOne(
        messageWhereUniqueInput: Prisma.MessageWhereUniqueInput
    ): Promise<Message | null> {
        return this.prisma.message.findUnique({
            where: messageWhereUniqueInput,
        });
    }

    async findMany<T extends Prisma.MessageInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.MessageWhereUniqueInput;
        where?: Prisma.MessageWhereInput;
        orderBy?: Prisma.MessageOrderByWithRelationInput;
        include?: T;
    }): Promise<Prisma.MessageGetPayload<{ include: T }>[] | Message[]> {
        const { skip, take, cursor, where, orderBy, include } = params;

        return this.prisma.message.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include,
        });
    }

    async create<T extends Prisma.MessageInclude>(params: {
        data: Prisma.MessageCreateInput;
        include?: T;
    }): Promise<Prisma.MessageGetPayload<{ include: T }> | Message | null> {
        return this.prisma.message.create(params);
    }

    async update<T extends Prisma.MessageInclude>(params: {
        where: Prisma.MessageWhereUniqueInput;
        data: Prisma.MessageUpdateInput;
        include?: T;
    }): Promise<Message> {
        const { where, data, include } = params;

        return this.prisma.message.update({
            where,
            data,
            include,
        });
    }

    async delete(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
        return this.prisma.message.delete({
            where,
        });
    }

    async normalize(
        recipientId: TValueOf<Pick<User, "id">>,
        input: TNormalizeMessageArgument
    ): Promise<TMessage> {
        const message = excludeSensitiveFields(input, [
            "isDeleteForEveryone",
            "usersDeletedThisMessage",
        ]) as never as TMessage;
        message.createdAt = normalizeDate(message.createdAt);
        let normalizedMessage: IStandardMessage | IForwardedMessage;
        if (!isForwardedMessagePrisma(message as any)) {
            normalizedMessage = excludeSensitiveFields(message, [
                "forwardedMessageId",
                "forwardedMessage" as any,
            ]) as IStandardMessage;
            normalizedMessage.text = codeBlocksToHTML(normalizedMessage.text);

            const hasFiles = normalizedMessage.files.length > 0;
            let files: TFileToClient[] = [];
            if (hasFiles) {
                files = this.fileService.normalizeFiles(
                    normalizedMessage.files as any[]
                );
            }
            normalizedMessage = {
                ...normalizedMessage,
                files,
            };

            normalizedMessage.links = findLinksInText(normalizedMessage.text);

            if (normalizedMessage.links.length > 0) {
                normalizedMessage.firstLinkInfo =
                    await this.linkPreviewService.getLinkInfo(
                        normalizedMessage.links[0]
                    );
            }

            if (normalizedMessage.replyToMessage) {
                normalizedMessage.replyToMessage.createdAt = normalizeDate(
                    normalizedMessage.replyToMessage.createdAt
                );
                if (isInnerForwardedMessage(normalizedMessage.replyToMessage)) {
                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(
                            normalizedMessage.replyToMessage,
                            ["replyToMessageId", "files", "text"] as any
                        ) as IInnerForwardedMessage,
                    } as IStandardMessage;
                } else if (isInnerMessage(normalizedMessage.replyToMessage)) {
                    normalizedMessage.replyToMessage.files =
                        this.fileService.normalizeFiles(
                            normalizedMessage.replyToMessage.files as any
                        );

                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(
                            normalizedMessage.replyToMessage,
                            ["forwardedMessageId"] as any
                        ) as IInnerMessage,
                    };

                    if (normalizedMessage.replyToMessage.text) {
                        normalizedMessage.replyToMessage.links =
                            findLinksInText(
                                normalizedMessage.replyToMessage.text
                            );
                    }
                    if (
                        normalizedMessage.replyToMessage.links &&
                        normalizedMessage.replyToMessage.links.length > 0
                    ) {
                        normalizedMessage.replyToMessage.firstLinkInfo =
                            await this.linkPreviewService.getLinkInfo(
                                normalizedMessage.replyToMessage.links[0]
                            );
                    }
                }
            }
        } else {
            normalizedMessage = excludeSensitiveFields(message, [
                "files",
                "replyToMessage",
                "replyToMessageId" as any,
            ]) as IForwardedMessage;

            if (isInnerForwardedMessage(normalizedMessage.forwardedMessage)) {
                normalizedMessage.forwardedMessage.createdAt = normalizeDate(
                    normalizedMessage.forwardedMessage.createdAt
                );
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(
                        normalizedMessage.forwardedMessage,
                        ["files", "replyToMessageId", "replyToMessage"] as any
                    ),
                } as IForwardedMessage;
            } else {
                normalizedMessage.forwardedMessage.createdAt = normalizeDate(
                    normalizedMessage.forwardedMessage.createdAt
                );
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(
                        normalizedMessage.forwardedMessage,
                        ["forwardedMessageId"] as any
                    ),
                } as IForwardedMessage;

                normalizedMessage.forwardedMessage.links = findLinksInText(
                    normalizedMessage.forwardedMessage.text
                );
                if (normalizedMessage.forwardedMessage.links.length > 0) {
                    normalizedMessage.forwardedMessage.firstLinkInfo =
                        await this.linkPreviewService.getLinkInfo(
                            normalizedMessage.forwardedMessage.links[0]
                        );
                }

                if (isInnerMessage(normalizedMessage.forwardedMessage)) {
                    normalizedMessage.forwardedMessage.files =
                        this.fileService.normalizeFiles(
                            normalizedMessage.forwardedMessage.files as any
                        );
                }
            }
        }
        normalizedMessage.isDeleted =
            input.isDeleteForEveryone ||
            input.usersDeletedThisMessage.some(({ id }) => id === recipientId);

        return normalizedMessage;
    }
}
