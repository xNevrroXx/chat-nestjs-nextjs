"use client";

import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { RoomType } from "@/models/room/IRoom.store";

const filteredUsersSelector = createSelector(
    [(state: TRootState) => state.users.users],
    (users) => {
        return users.map<{ id: string; name: string; type: RoomType }>(
            (user) => {
                return {
                    id: user.id,
                    name: user.displayName,
                    type: RoomType.PRIVATE,
                };
            },
        );
    },
);

export { filteredUsersSelector };
