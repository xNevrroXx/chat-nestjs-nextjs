import { createAction } from "@reduxjs/toolkit";
import {
    TAddRecentRoomData,
    TUpdateInputData,
} from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";

const update = createAction<TUpdateInputData>("recent-rooms/update-by-id");

const remove = createAction<TValueOf<Pick<IRoom, "id">>>(
    "recent-rooms/remove-by-id",
);
const reset = createAction<void>("recent-rooms/reset");
const add = createAction<TAddRecentRoomData>("recent-rooms/add");

export {
    update as updateRecentRoomData,
    remove as removeRecentRoomData,
    reset as resetCurrentRoomId,
    add as addRecentRoomData,
};
