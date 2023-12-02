import { Injectable } from "@nestjs/common";
import { Prisma, Room } from "@prisma/client";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class RoomService {
    constructor(private readonly prisma: DatabaseService) {}

    async findOne(
        roomWhereUniqueInput: Prisma.RoomWhereUniqueInput
    ): Promise<Room | null> {
        return this.prisma.room.findUnique({
            where: roomWhereUniqueInput,
        });
    }

    async findMany<T extends Prisma.RoomInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RoomWhereUniqueInput;
        where?: Prisma.RoomWhereInput;
        orderBy?: Prisma.RoomOrderByWithRelationInput;
        select?: Prisma.RoomSelect;
        include?: T;
    }): Promise<Prisma.RoomGetPayload<{ include: T }>[] | Room[]> {
        const { skip, take, cursor, where, orderBy, include } = params;

        return this.prisma.room.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include,
        });
    }

    async create<T extends Prisma.RoomInclude>(params: {
        data: Prisma.RoomCreateInput;
        include?: T;
    }): Promise<Prisma.RoomGetPayload<{ include: T }> | Room | null> {
        return this.prisma.room.create(params);
    }

    async update(params: {
        where: Prisma.RoomWhereUniqueInput;
        data: Prisma.RoomUpdateInput;
    }): Promise<Room> {
        const { where, data } = params;

        return this.prisma.room.update({
            where,
            data,
        });
    }

    async delete(where: Prisma.RoomWhereUniqueInput): Promise<Room> {
        return this.prisma.room.delete({
            where,
        });
    }
}
