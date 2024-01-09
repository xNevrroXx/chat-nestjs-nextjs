import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { IRoom, TPreviewExistingRoomWithFlag } from "@/models/room/IRoom.store";

const activeRoomSelector = createSelector(
    [(state: RootState) => state.room, (state: RootState) => state.recentRooms],
    (rooms, recentRooms): IRoom | TPreviewExistingRoomWithFlag | undefined => {
        const currentRoomId = recentRooms.currentRoomId;
        if (!currentRoomId) {
            return;
        }

        if (
            recentRooms.rooms.byId[currentRoomId] &&
            recentRooms.rooms.byId[currentRoomId].isPreview
        ) {
            return {
                ...rooms.previews.rooms.find(
                    (room) => room.id === currentRoomId,
                )!,
                isPreview: true,
            };
        }

        return rooms.local.rooms.byId[currentRoomId];
    },
);

export { activeRoomSelector };
