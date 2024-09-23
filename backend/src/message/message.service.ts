import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
    type Message,
    PinnedMessage,
    Prisma,
    PrismaPromise,
    User,
} from "@prisma/client";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IOriginalMessage,
    isForwardedMessagePrisma,
    isReplyMessagePrisma,
    TMessage,
    TNormalizeMessageArgument,
} from "./message.model";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { FileService } from "../file/file.service";
import { findLinksInText } from "../utils/findLinksInText";
import { LinkPreviewService } from "../link-preview/link-preview.service";
import { TValueOf } from "../models/TUtils";
import { DATE_FORMATTER_DATE } from "../utils/normalizeDate";
import { codeBlocksToHTML } from "../utils/codeBlocksToHTML";
import { TFileToClient } from "../file/file.model";

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly fileService: FileService,
        private readonly linkPreviewService: LinkPreviewService
    ) {}

    async findOne<T extends Prisma.MessageInclude>(params: {
        where: Prisma.MessageWhereUniqueInput;
        include?: T;
    }): Promise<Message | Prisma.MessageGetPayload<{ include: T }> | null> {
        const { where, include } = params;

        return this.prisma.message.findUnique({
            where,
            include,
        });
    }

    async findOnePinned<T extends Prisma.PinnedMessageInclude>(params: {
        where: Prisma.PinnedMessageWhereUniqueInput;
        include?: T;
    }): Promise<
        PinnedMessage | Prisma.PinnedMessageGetPayload<{ include: T }> | null
    > {
        const { where, include } = params;

        return this.prisma.pinnedMessage.findUnique({
            where,
            include,
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

    updateMany(params: {
        where: Prisma.MessageWhereInput;
        data: Prisma.MessageUpdateInput;
    }): PrismaPromise<Prisma.BatchPayload> {
        const { where, data } = params;

        return this.prisma.message.updateMany({
            where,
            data,
        });
    }

    async delete(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
        return this.prisma.message.delete({
            where,
        });
    }

    async normalize(
        recipientId: TValueOf<Pick<User, "id">>,
        inputMessagePrisma: TNormalizeMessageArgument
    ): Promise<IInnerStandardMessage | IInnerForwardedMessage> {
        if (!inputMessagePrisma) {
            return;
        }

        const message = excludeSensitiveFields(inputMessagePrisma, [
            "isDeleteForEveryone",
            "userDeletedThisMessage",
            "replyToMessageId",
            // @ts-ignore
            "replyToMessage",
        ]) as never as TMessage;

        const normalizedOriginalMessage: IOriginalMessage = {
            id: message.id,
            roomId: message.roomId,
            senderId: message.senderId,
            hasRead: message.hasRead,
            isDeleted:
                inputMessagePrisma.isDeleteForEveryone ||
                inputMessagePrisma.userDeletedThisMessage.some(
                    ({ userId }) => userId === recipientId
                ),
            firstLinkInfo: null,
            links: findLinksInText(message.text),
            text: codeBlocksToHTML(message.text),

            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };

        if (normalizedOriginalMessage.links.length > 0) {
            const firstLink = normalizedOriginalMessage.links[0];
            try {
                normalizedOriginalMessage.firstLinkInfo =
                    await this.linkPreviewService.getLinkInfo(firstLink);
            } catch (error) {
                normalizedOriginalMessage.firstLinkInfo = {
                    url: firstLink,
                    title: "",
                    shortTitle: undefined,
                    favicon: "",
                    description: "",
                    image: "",
                    author: "",
                };
                console.warn(error);
            }
        }

        let normalizedInnerMessage:
            | IInnerStandardMessage
            | IInnerForwardedMessage;
        if (isForwardedMessagePrisma(inputMessagePrisma)) {
            const date = DATE_FORMATTER_DATE.format(
                new Date(inputMessagePrisma.forwardedMessage.createdAt)
            );

            normalizedInnerMessage = {
                ...normalizedOriginalMessage,
                forwardedMessage: {
                    id: inputMessagePrisma.forwardedMessageId,
                    date: date,
                },
            };
        } else {
            normalizedInnerMessage = {
                ...normalizedOriginalMessage,
                replyToMessage: null,
                files: [],
            };

            if (isReplyMessagePrisma(inputMessagePrisma)) {
                const date =
                    inputMessagePrisma.replyToMessage &&
                    DATE_FORMATTER_DATE.format(
                        new Date(inputMessagePrisma.replyToMessage.createdAt)
                    );

                normalizedInnerMessage.replyToMessage = {
                    id: inputMessagePrisma.replyToMessageId,
                    date: date,
                };
            }

            const hasFiles = inputMessagePrisma.files.length > 0;
            if (hasFiles) {
                normalizedInnerMessage.files = inputMessagePrisma.files.map(
                    (rawFile) => this.fileService.normalize(rawFile)
                );
            }
        }

        normalizedInnerMessage.isDeleted =
            inputMessagePrisma.isDeleteForEveryone ||
            inputMessagePrisma.userDeletedThisMessage.some(
                ({ userId }) => userId === recipientId
            );

        return normalizedInnerMessage;
    }
}
