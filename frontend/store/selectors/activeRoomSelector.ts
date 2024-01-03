import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { IRoom } from "@/models/room/IRoom.store";


const activeRoomSelector = createSelector(
    [
        (state: RootState) => state.room.rooms,
        (state: RootState) => state.recentRooms.currentRoomId,
    ],
    (rooms, currentRoomId): IRoom | undefined => {
        return rooms.find(room => room.id === currentRoomId);
    }
);

export {activeRoomSelector};
