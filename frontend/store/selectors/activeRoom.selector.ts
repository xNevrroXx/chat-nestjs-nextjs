import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import {
    TPreviewExistingRoomWithFlag,
    TRoomWithPreviewFlag,
} from "@/models/room/IRoom.store";

const activeRoomSelector = createSelector(
    [
        (state: TRootState) => state.room,
        (state: TRootState) => state.recentRooms,
    ],
    (
        rooms,
        recentRooms,
    ): TRoomWithPreviewFlag | TPreviewExistingRoomWithFlag | null => {
        const currentRoomId = recentRooms.currentRoomId;
        if (!currentRoomId) {
            return null;
        }

        if (
            recentRooms.rooms.byId[currentRoomId] &&
            recentRooms.rooms.byId[currentRoomId].isPreview &&
            rooms.previews.rooms.some((room) => room.id === currentRoomId)
        ) {
            return {
                ...rooms.previews.rooms.find(
                    (room) => room.id === currentRoomId,
                )!,
                isPreview: true,
            };
        }

        if (rooms.local.rooms.byId[currentRoomId]) {
            return {
                ...rooms.local.rooms.byId[currentRoomId],
                isPreview: false,
            };
        }

        return null;
    },
);

export { activeRoomSelector };
