import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { IUserDto } from "@/models/auth/IAuth.store";

const messageOwnerSelector = createSelector(
    [
        (state: TRootState) => state.authentication.user,
        (state: TRootState) => state.users.users,
        (_, senderId: string | undefined | null) => senderId,
    ],
    (user, users, senderId): IUserDto | undefined => {
        if (!senderId) {
            return;
        }
        if (user && user.id === senderId) {
            return user;
        }
        return users.find((user) => user.id === senderId);
    },
);

export { messageOwnerSelector };
