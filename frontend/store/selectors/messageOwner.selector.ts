import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { IUserDto } from "@/models/auth/IAuth.store";

const messageOwnerSelector = createSelector(
    [
        (state: TRootState) => state.authentication.user,
        (state: TRootState) => state.users.users,
        (_, messageId: string | undefined | null) => messageId,
    ],
    (user, users, targetId): IUserDto | undefined => {
        if (!targetId) {
            return;
        }
        if (user && user.id === targetId) {
            return user;
        }
        return users.find((user) => user.id === targetId);
    },
);

export { messageOwnerSelector };
