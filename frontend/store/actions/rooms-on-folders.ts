import { createAction } from "@reduxjs/toolkit";
import { TValueOf } from "@/models/TUtils";
import { IFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";
import { IRoom } from "@/models/room/IRoom.store";

const changeCurrent = createAction<TValueOf<Pick<IFolder, "id">> | null>(
    "folders/change-current",
);
const excludeRoomFromFolders = createAction<TValueOf<Pick<IRoom, "id">>>(
    "folders/exclude-everywhere",
);

export { changeCurrent as changeCurrentFolder, excludeRoomFromFolders };
