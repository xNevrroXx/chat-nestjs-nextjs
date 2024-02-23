import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";

type TParticipantsReturnType = { myId: string; participants: string[] };
const roomParticipantsSelector = createSelector(
    [
        (state: TRootState) => state.room,
        (_: TRootState, roomId: string) => roomId,
    ],
    (roomSlice, roomId): TParticipantsReturnType => {
        return {
            myId: roomSlice.userId,
            participants: roomSlice.local.rooms.byId[roomId].participants.map(
                (participant) => participant.userId,
            ),
        };
    },
);

export { roomParticipantsSelector };
