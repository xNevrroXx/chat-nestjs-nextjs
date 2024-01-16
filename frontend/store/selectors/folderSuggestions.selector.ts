import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { IFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";

type TFolderSuggestionsReturnType = Pick<IFolder, "id" | "name"> & {
    isInThisFolder: boolean;
};
const folderSuggestionsSelector = createSelector(
    [
        (state: TRootState) => state.folders,
        (state: TRootState) => state.room.local.rooms,
        (_, roomId: string) => roomId,
    ],
    (folders, rooms, roomId): TFolderSuggestionsReturnType[] => {
        const targetRoom = rooms.byId[roomId];
        if (!targetRoom) {
            return [];
        }

        return Object.values(
            folders.folders.byId,
        ).map<TFolderSuggestionsReturnType>((folder) => {
            if (folder.roomIds.includes(targetRoom.id)) {
                return {
                    id: folder.id,
                    name: folder.name,
                    isInThisFolder: true,
                };
            }

            return {
                id: folder.id,
                name: folder.name,
                isInThisFolder: false,
            };
        });
    },
);

export { folderSuggestionsSelector };
