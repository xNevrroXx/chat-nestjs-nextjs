import { Folder } from "@prisma/client";

export interface IFolder extends Folder {
    roomIds: string[];
}

export const PrismaIncludeFullFolderInfo = {
    roomOnFolder: {
        include: {
            room: true,
        },
    },
};
