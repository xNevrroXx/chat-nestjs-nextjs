import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import {
    TPreviewExistingRoomWithFlag,
    TRoomWithPreviewFlag,
} from "@/models/room/IRoom.store";

const findRoomByIdSelector = createSelector(
    [(state: TRootState) => state.room, (_, roomId: string | null) => roomId],
    (
        roomSlice,
        targetRoomId,
    ): TRoomWithPreviewFlag | TPreviewExistingRoomWithFlag | null => {
        if (!targetRoomId) {
            return null;
        }

        if (roomSlice.local.allIds.includes(targetRoomId)) {
            return {
                ...roomSlice.local.rooms.byId[targetRoomId],
                isPreview: false,
            };
        }

        const previewRoom = roomSlice.previews.rooms.find(
            (previewRoom) => previewRoom.id === targetRoomId,
        );
        if (previewRoom) {
            return {
                ...previewRoom,
                isPreview: true,
            };
        }

        return null;
    },
);

export { findRoomByIdSelector };
