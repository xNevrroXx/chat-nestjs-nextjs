import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import {
    IForwardedMessage,
    IInnerForwardedMessage,
    IInnerMessage,
    IMessage,
} from "@/models/room/IRoom.store";
import { IUserDto } from "@/models/auth/IAuth.store";

const messageOwnerSelector = createSelector(
    [
        (state: RootState) => state.authentication.user,
        (state: RootState) => state.users.users,
        (
            _,
            message:
                | IMessage
                | IForwardedMessage
                | IInnerMessage
                | IInnerForwardedMessage,
        ) => message,
    ],
    (user, users, message): IUserDto | undefined => {
        const senderId = message.senderId;
        if (user && user.id === senderId) {
            return user;
        }
        return users.find((user) => user.id === senderId);
    },
);

export { messageOwnerSelector };
