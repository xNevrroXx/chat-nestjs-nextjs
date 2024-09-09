import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";

const findMessageForActionSelector = createSelector(
    [
        (state: TRootState) => state.recentRooms,
        (_, roomId: TValueOf<Pick<IRoom, "id">>) => roomId,
    ],
    (recentRoomsSlice, roomId) => {
        const roomData = recentRoomsSlice.rooms.byId[roomId];

        return roomData && roomData.input.messageForAction;
    },
);

export { findMessageForActionSelector };
