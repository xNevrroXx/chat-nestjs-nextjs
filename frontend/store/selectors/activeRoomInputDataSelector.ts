import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { IRecentRoom } from "@/models/recent-rooms/IRecentRooms.store";


const activeRoomInputDataSelector = createSelector(
    [
        (state: RootState) => state.recentRooms,
    ],
    (recentRoomsInfo): IRecentRoom | undefined => {
        if (!recentRoomsInfo.currentRoomId) {
            return;
        }

        return recentRoomsInfo.rooms.byId[recentRoomsInfo.currentRoomId];
    }
);

export {activeRoomInputDataSelector};
