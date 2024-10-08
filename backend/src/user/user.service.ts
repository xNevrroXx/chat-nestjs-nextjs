import {
    BadRequestException,
    BeforeApplicationShutdown,
    Injectable,
} from "@nestjs/common";
import {
    Prisma,
    Room,
    type User,
    UserOnline,
    UserTyping,
} from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { TValueOf } from "../models/TUtils";
import { IUserSessionPayload } from "./user.model";

@Injectable()
export class UserService implements BeforeApplicationShutdown {
    constructor(private readonly prisma: DatabaseService) {}

    async beforeApplicationShutdown(signal?: string) {
        const updatedAt = new Date();

        await this.prisma.userOnline.updateMany({
            data: {
                isOnline: false,
                updatedAt: updatedAt,
            },
        });

        await this.prisma.userTyping.updateMany({
            data: {
                isTyping: false,
                updatedAt: updatedAt,
            },
        });
    }

    async findOne<T extends Prisma.UserInclude>(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
        include?: T
    ): Promise<Prisma.UserGetPayload<{ include: T }> | User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
            include,
        });
    }

    async findMany<T extends Prisma.UserInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        include?: T;
    }): Promise<Prisma.UserGetPayload<{ include: T }>[] | User[]> {
        const { skip, take, cursor, where, orderBy, include } = params;

        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include,
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const isExistAlready = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (isExistAlready) {
            throw new BadRequestException(
                `Пользователь с почтовым адресом ${data.email} уже существует`
            );
        }

        // todo send message from the main user about features and benefits of the application.////////
        return this.prisma.user.create({
            data,
        });
    }

    async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        const isExist = this.prisma.user.findUnique({ where });
        if (!isExist) {
            throw new BadRequestException(
                `Пользователя с почтовым адресом ${data.email} не сущeствует`
            );
        }

        return this.prisma.user.update({
            data: {
                ...data,
                updatedAt: new Date(),
            },
            where,
        });
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({ where });
    }

    async updateOnlineStatus(params: {
        userId: TValueOf<Pick<IUserSessionPayload, "id">>;
        isOnline: TValueOf<Pick<UserOnline, "isOnline">>;
    }): Promise<UserOnline> {
        const { userId, isOnline } = params;

        return this.prisma.userOnline.upsert({
            where: {
                userId,
            },
            update: {
                isOnline,
                updatedAt: new Date(),
            },
            create: {
                userId,
                isOnline,
            },
        });
    }

    async updateTypingStatus(params: {
        userId: TValueOf<Pick<IUserSessionPayload, "id">>;
        roomId: TValueOf<Pick<Room, "id">>;
        isTyping: TValueOf<Pick<UserTyping, "isTyping">>;
    }): Promise<UserTyping> {
        const { userId, roomId, isTyping } = params;

        return this.prisma.userTyping.upsert({
            where: {
                userId,
            },
            update: {
                isTyping,
                updatedAt: new Date(),
            },
            create: {
                isTyping,
                user: {
                    connect: {
                        id: userId,
                    },
                },
                room: {
                    connect: {
                        id: roomId,
                    },
                },
            },
        });
    }
}
