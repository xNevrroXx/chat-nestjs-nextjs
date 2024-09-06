import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { TValueOf } from "@/models/TUtils";
import { IRoom, TPinnedMessage } from "@/models/room/IRoom.store";

const pinnedMessagesSelector = createSelector(
    [
        (state: TRootState) => state.room.local,
        (state: TRootState) => state.room.previews,
        (_, roomId: TValueOf<Pick<IRoom, "id">>) => roomId,
    ],
    (localRooms, previewRooms, targetRoomId): TPinnedMessage[] => {
        console.log("targetRoomID selector: ", targetRoomId);
        if (localRooms.allIds.includes(targetRoomId)) {
            return localRooms.rooms.byId[targetRoomId].pinnedMessages;
        }

        const previewRoom = previewRooms.rooms.find(
            (previewRoom) => previewRoom.id === targetRoomId,
        );
        if (previewRoom) {
            return previewRoom.pinnedMessages;
        }

        console.log("HERE");
        return [];
    },
);

export { pinnedMessagesSelector };
