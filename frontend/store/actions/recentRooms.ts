import { createAction } from "@reduxjs/toolkit";
import { IRecentRoom } from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";



const update = createAction<IRecentRoom>("recent-rooms/update-by-id");
const remove = createAction<TValueOf<Pick<IRoom, "id">>>("recent-rooms/remove-by-id");
const add =  createAction<IRecentRoom>("recent-rooms/add");

export {
    update as updateRecentRoomData,
    remove as removeRecentRoomData,
    add as addRecentRoomData
};
