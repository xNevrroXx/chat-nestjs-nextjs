import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";

const findMessageForActionSelector = createSelector(
    [
        (state: TRootState) => state.room,
        (
            _,
            roomId: TValueOf<Pick<IRoom, "id">> | null | undefined,
            messageId: string,
            date: string,
        ) => ({
            messageId,
            roomId,
            date,
        }),
    ],
    (roomSlice, { roomId, messageId, date }) => {
        if (!roomId) {
            return null;
        }

        return roomSlice.local.rooms.byId[roomId].days[date].find(
            (msg) => msg.id === messageId,
        );
    },
);

export { findMessageForActionSelector };
