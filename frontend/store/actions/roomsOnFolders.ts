import { createAction } from "@reduxjs/toolkit";
import { TValueOf } from "@/models/TUtils";
import { IFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";

const changeCurrent = createAction<TValueOf<Pick<IFolder, "id">> | null>(
    "folders/change-current",
);

export { changeCurrent as changeCurrentFolder };
