import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";

export interface IRoomOnFoldersSlice {
    folders: {
        byId: {
            [id: TValueOf<Pick<IFolder, "id">>]: IFolder;
        };
    };
    allIds: TValueOf<Pick<IFolder, "id">>[];
    current: TValueOf<Pick<IFolder, "id">> | null;
}

export interface IFolder {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date | null;
    roomIds: string[];
}

// actions
export type TCreateFolder = Pick<IFolder, "name">;
export type TRemoveFolder = {
    folderId: TValueOf<Pick<IFolder, "id">>;
};
export type TAddRoom = {
    folderId: TValueOf<Pick<IFolder, "id">>;
    roomId: TValueOf<Pick<IRoom, "id">>;
};
export type TExcludeRoom = TAddRoom;
