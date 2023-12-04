"use client";

import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { RoomType, TTemporarilyRoomOrUserBySearch } from "@/models/IStore/IRoom";

const filteredUsersSelector = createSelector(
    [
        (state: RootState) => state.users.users,
    ],
    (users) => {
        return users
            .map<TTemporarilyRoomOrUserBySearch>(user => {
                return {
                    id: user.id,
                    name: user.displayName,
                    type: RoomType.PRIVATE
                };
            });
    }
);

export { filteredUsersSelector };
