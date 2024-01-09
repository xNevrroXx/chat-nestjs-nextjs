import { createAction } from "@reduxjs/toolkit";
import { IRecentRoom } from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";

type TAddRecentRoomData = {
    id: TValueOf<Pick<IRoom, "id">>;
    isPreview?: true;
};

const update = createAction<Omit<IRecentRoom, "isPreview">>(
    "recent-rooms/update-by-id",
);
const remove = createAction<TValueOf<Pick<IRoom, "id">>>(
    "recent-rooms/remove-by-id",
);
const add = createAction<TAddRecentRoomData>("recent-rooms/add");

export {
    update as updateRecentRoomData,
    remove as removeRecentRoomData,
    add as addRecentRoomData,
};
