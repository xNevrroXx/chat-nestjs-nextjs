import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";

const isMeMessageOwnerSelector = createSelector(
    [
        (state: TRootState) => state.authentication.user,
        (_, senderId: string | undefined | null) => senderId,
    ],
    (user, senderId): boolean => {
        return !!user && user.id === senderId;
    },
);

export { isMeMessageOwnerSelector };
