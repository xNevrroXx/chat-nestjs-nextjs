import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { RoomType } from "@/models/room/IRoom.store";

const findInterlocutorByRoomIdSelector = createSelector(
    [
        (state: TRootState) => state.authentication,
        (state: TRootState) => state.users,
        (state: TRootState) => state.room.local,
        (_, roomId: string | undefined | null) => roomId,
    ],
    (authSlice, usersSlice, localRooms, roomId) => {
        const room = roomId && localRooms.rooms.byId[roomId];
        if (
            !room ||
            room.type === RoomType.GROUP ||
            !room.participants ||
            !authSlice.isAuthenticated
        ) {
            return;
        }

        const interlocutor = room.participants.find(
            (member) => member.userId !== authSlice.user.id,
        )!;
        return usersSlice.users.find((user) => user.id === interlocutor.userId);
    },
);

export { findInterlocutorByRoomIdSelector };
