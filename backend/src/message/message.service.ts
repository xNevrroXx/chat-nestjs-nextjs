import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { type Message, Prisma, User } from "@prisma/client";
import {
    ForwardedMessagePrisma,
    FullMessageInfo,
    IForwardedMessage,
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IOriginalMessage,
    isForwardedMessagePrisma,
    isForwardedMessagePrisma2,
    isInnerForwardedMessage,
    isInnerMessage,
    isReplyMessagePrisma,
    IStandardMessage,
    OriginalMessagePrisma,
    ReplyMessagePrisma,
    TMessage,
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

    async normalizeOriginalMessage(
        recipientId: TValueOf<Pick<User, "id">>,
        inputMessagePrisma: Prisma.MessageGetPayload<{
            include: typeof OriginalMessagePrisma;
        }>
    ): Promise<IInnerStandardMessage | IInnerForwardedMessage> {
        if (!inputMessagePrisma) {
            return;
        }

        const message = excludeSensitiveFields(inputMessagePrisma, [
            "isDeleteForEveryone",
            "usersDeletedThisMessage",
        ]) as never as TMessage;

        const normalizedOriginalMessage: IOriginalMessage = {
            id: message.id,
            roomId: message.roomId,
            senderId: message.senderId,
            hasRead: message.hasRead,
            isDeleted:
                inputMessagePrisma.isDeleteForEveryone ||
                inputMessagePrisma.usersDeletedThisMessage.some(
                    ({ id }) => id === recipientId
                ),
            firstLinkInfo: null,
            links: findLinksInText(message.text),
            text: codeBlocksToHTML(message.text),

            createdAt: normalizeDate(message.createdAt),
            updatedAt: message.updatedAt && normalizeDate(message.updatedAt),
        };

        if (normalizedOriginalMessage.links.length > 0) {
            const firstLink = normalizedOriginalMessage.links[0];
            normalizedOriginalMessage.firstLinkInfo =
                await this.linkPreviewService.getLinkInfo(firstLink);
        }

        let normalizedInnerMessage:
            | IInnerStandardMessage
            | IInnerForwardedMessage;
        if (inputMessagePrisma.forwardedMessageId) {
            normalizedInnerMessage = {
                ...normalizedOriginalMessage,
                forwardedMessageId: inputMessagePrisma.forwardedMessageId,
            };
        } else {
            normalizedInnerMessage = {
                ...normalizedOriginalMessage,
                replyToMessageId: inputMessagePrisma.replyToMessageId,
                files: [],
            };

            const hasFiles = inputMessagePrisma.files.length > 0;
            if (hasFiles) {
                normalizedInnerMessage.files = this.fileService.normalizeFiles(
                    inputMessagePrisma.files as any[]
                );
            }
        }

        normalizedInnerMessage.isDeleted =
            inputMessagePrisma.isDeleteForEveryone ||
            inputMessagePrisma.usersDeletedThisMessage.some(
                ({ id }) => id === recipientId
            );

        return normalizedInnerMessage;
    }

    async normalize(
        recipientId: TValueOf<Pick<User, "id">>,
        inputMessagePrisma: TNormalizeMessageArgument
    ): Promise<IStandardMessage | IForwardedMessage> {
        const mainMessage = await this.normalizeOriginalMessage(
            recipientId,
            inputMessagePrisma
        );

        if (isForwardedMessagePrisma2(inputMessagePrisma)) {
            const innerForwardedMessage = (await this.normalizeOriginalMessage(
                recipientId,
                inputMessagePrisma.forwardedMessage
            )) as IInnerForwardedMessage;

            return {
                ...(mainMessage as IInnerForwardedMessage),
                forwardedMessage: innerForwardedMessage,
            };
        } else {
            const innerStandardMessage = (await this.normalizeOriginalMessage(
                recipientId,
                inputMessagePrisma.replyToMessage
            )) as IInnerStandardMessage;

            return {
                ...(mainMessage as IInnerStandardMessage),
                replyToMessage: innerStandardMessage,
            };
        }
    }
}
