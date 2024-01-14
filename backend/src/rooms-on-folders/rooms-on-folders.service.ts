import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { Folder, Prisma, RoomOnFolder } from "@prisma/client";
import { IFolder, PrismaIncludeFullFolderInfo } from "./rooms-on-folders.model";

@Injectable()
export class RoomsOnFoldersService {
    constructor(private readonly prisma: DatabaseService) {}

    normalize(
        folder: Prisma.FolderGetPayload<{
            include: typeof PrismaIncludeFullFolderInfo;
        }>
    ): IFolder {
        const result = {
            ...folder,
            roomIds: folder.roomOnFolder.map(
                (roomOnFolder) => roomOnFolder.room.id
            ),
        };

        delete result.roomOnFolder;

        return result;
    }

    async addRoomOnFolder<T extends Prisma.RoomOnFolderInclude>(params: {
        data: Prisma.RoomOnFolderCreateInput;
        include?: T;
    }): Promise<
        RoomOnFolder | Prisma.RoomOnFolderGetPayload<{ include: T }> | null
    > {
        return this.prisma.roomOnFolder.create(params);
    }

    async removeRoomFromFolder<T extends Prisma.RoomOnFolderInclude>(params: {
        where: Prisma.RoomOnFolderWhereUniqueInput;
        include?: T;
    }): Promise<
        RoomOnFolder | Prisma.RoomOnFolderGetPayload<{ include: T }> | null
    > {
        return this.prisma.roomOnFolder.delete(params);
    }

    async find<T extends Prisma.FolderInclude>(params: {
        where: Prisma.FolderWhereUniqueInput;
        include?: T;
    }): Promise<Folder | Prisma.FolderGetPayload<{ include: T }> | null> {
        return this.prisma.folder.findUnique(params);
    }

    async findMany<T extends Prisma.FolderInclude>(params: {
        where: Prisma.FolderWhereInput;
        include?: T;
    }): Promise<Folder[] | Prisma.FolderGetPayload<{ include: T }>[] | null> {
        return this.prisma.folder.findMany(params);
    }
    async create<T extends Prisma.FolderInclude>(params: {
        data: Prisma.FolderCreateInput;
        include?: T;
    }): Promise<Folder | Prisma.FolderGetPayload<{ include: T }> | null> {
        return this.prisma.folder.create(params);
    }

    async update<T extends Prisma.FolderInclude>(params: {
        where: Prisma.FolderWhereUniqueInput;
        data: Prisma.FolderUpdateInput;
        include?: T;
    }): Promise<Folder | Prisma.FolderGetPayload<{ include: T }> | null> {
        return this.prisma.folder.update(params);
    }

    async delete<T extends Prisma.FolderInclude>(params: {
        where: Prisma.FolderWhereUniqueInput;
        include?: T;
    }): Promise<Folder | Prisma.FolderGetPayload<{ include: T }> | null> {
        return this.prisma.folder.delete(params);
    }
}
