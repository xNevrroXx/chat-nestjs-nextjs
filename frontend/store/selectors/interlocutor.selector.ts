import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { RoomType, TParticipant } from "@/models/room/IRoom.store";

const interlocutorSelector = createSelector(
    [
        (state: TRootState) => state.users,
        (_, roomType: RoomType, participants: TParticipant[]) => ({
            roomType,
            participants,
        }),
    ],
    (usersSlice, { roomType, participants }) => {
        if (roomType === RoomType.GROUP || !participants) {
            return;
        }

        return usersSlice.users.find(
            (user) => user.id === participants[0].userId,
        );
    },
);

export { interlocutorSelector };
