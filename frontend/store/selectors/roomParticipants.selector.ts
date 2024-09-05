import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";

type TParticipantsReturnType = { myId: string; participants: string[] };
const roomParticipantsSelector = createSelector(
    [
        (state: TRootState) => state.room,
        (_: TRootState, roomId: string | null) => roomId,
    ],
    (roomSlice, roomId): TParticipantsReturnType => {
        const participants = roomId
            ? roomSlice.local.rooms.byId[roomId].participants.map(
                  (participant) => participant.userId,
              )
            : null;

        return {
            myId: roomSlice.userId,
            participants: participants || [],
        };
    },
);

export { roomParticipantsSelector };
