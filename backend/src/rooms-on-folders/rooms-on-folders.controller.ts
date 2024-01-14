import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
} from "@nestjs/common";
import { RoomsOnFoldersService } from "./rooms-on-folders.service";
import { Prisma } from "@prisma/client";
import { IFolder, PrismaIncludeFullFolderInfo } from "./rooms-on-folders.model";
import { TNormalizedList } from "../models/TNormalizedList";
import { IRoom } from "../room/IRooms";

@Controller("folders")
export class RoomsOnFoldersController {
    constructor(
        private readonly roomsOnFoldersService: RoomsOnFoldersService
    ) {}

    @HttpCode(HttpStatus.OK)
    @Get("all")
    async getAll(@Req() request): Promise<TNormalizedList<IFolder>> {
        const user = request.user;

        const queryResult = (await this.roomsOnFoldersService.findMany({
            where: {
                userId: user.id,
            },
            include: PrismaIncludeFullFolderInfo,
        })) as Prisma.FolderGetPayload<{
            include: typeof PrismaIncludeFullFolderInfo;
        }>[];

        return queryResult.reduce<TNormalizedList<IFolder>>(
            (prev, curr) => {
                prev = {
                    values: {
                        byId: {
                            ...prev.values.byId,
                            [curr.id]:
                                this.roomsOnFoldersService.normalize(curr),
                        },
                    },
                    allIds: prev.allIds.concat(curr.id),
                };
                return prev;
            },
            {
                values: {
                    byId: {},
                },
                allIds: [],
            }
        );
    }

    @HttpCode(HttpStatus.CREATED)
    @Post("create")
    async createFolder(
        @Req() request,
        @Body() { name }: { name: string }
    ): Promise<IFolder> {
        const user = request.user;

        const newFolder = (await this.roomsOnFoldersService.create({
            data: {
                name: name,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
            include: PrismaIncludeFullFolderInfo,
        })) as Prisma.FolderGetPayload<{
            include: typeof PrismaIncludeFullFolderInfo;
        }>;

        return this.roomsOnFoldersService.normalize(newFolder);
    }

    @HttpCode(HttpStatus.OK)
    @Delete("remove")
    async removeFolder(
        @Req() request,
        @Body() { folderId }: { folderId: string }
    ): Promise<void> {
        const user = request.user;

        await this.roomsOnFoldersService.delete({
            where: {
                id: folderId,
                userId: user.id,
            },
        });
    }

    @HttpCode(HttpStatus.CREATED)
    @Post("add-room")
    async addRoom(
        @Req() request,
        @Body() { folderId, roomId }: { folderId: string; roomId: string }
    ): Promise<void> {
        const user = request.user;

        const targetFolder = await this.roomsOnFoldersService.find({
            where: {
                id: folderId,
                userId: user.id,
            },
        });
        if (!targetFolder) {
            throw new BadRequestException();
        }

        await this.roomsOnFoldersService.addRoomOnFolder({
            data: {
                folder: {
                    connect: {
                        id: targetFolder.id,
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

    @HttpCode(HttpStatus.OK)
    @Delete("exclude-room")
    async excludeRoom(
        @Req() request,
        @Body() { folderId, roomId }: { folderId: string; roomId: string }
    ): Promise<void> {
        const user = request.user;

        const targetFolder = await this.roomsOnFoldersService.find({
            where: {
                id: folderId,
                userId: user.id,
            },
        });
        if (!targetFolder) {
            throw new BadRequestException();
        }

        await this.roomsOnFoldersService.removeRoomFromFolder({
            where: {
                folderId_roomId: {
                    roomId,
                    folderId,
                },
            },
        });
    }
}
