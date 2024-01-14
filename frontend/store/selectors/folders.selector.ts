import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { IFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";

const foldersSelector = createSelector(
    [(state: TRootState) => state.folders],
    (folders): IFolder[] => {
        return Object.values(folders.folders.byId);
    },
);

export { foldersSelector };
