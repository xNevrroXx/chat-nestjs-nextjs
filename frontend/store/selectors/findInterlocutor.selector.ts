import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { RoomType, TParticipant } from "@/models/room/IRoom.store";

const findInterlocutorSelector = createSelector(
    [
        (state: TRootState) => state.authentication,
        (state: TRootState) => state.users,
        (_, roomType: RoomType, participants: TParticipant[]) => ({
            roomType,
            participants,
        }),
    ],
    (authSlice, usersSlice, { roomType, participants }) => {
        if (
            roomType === RoomType.GROUP ||
            !participants ||
            !authSlice.isAuthenticated
        ) {
            return;
        }

        const interlocutor = participants.find(
            (member) => member.userId !== authSlice.user.id,
        )!;
        return usersSlice.users.find((user) => user.id === interlocutor.userId);
    },
);

export { findInterlocutorSelector };
