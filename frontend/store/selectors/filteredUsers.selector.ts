"use client";

import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";

const filteredUsersSelector = createSelector(
    [(state: TRootState) => state.users.users],
    (users) => {
        return users
            .filter((user) => !user.isDeleted)
            .map<{ id: string; displayName: string }>((user) => {
                return {
                    id: user.id,
                    displayName: user.displayName,
                };
            });
    },
);

export { filteredUsersSelector };
