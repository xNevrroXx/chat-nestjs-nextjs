import {createAction} from "@reduxjs/toolkit";
import {
    IParticipant,
    IMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket,
    IForwardedMessage
} from "@/models/IStore/IRoom";
import {TValueOf} from "@/models/TUtils";
import {IUserDto} from "@/models/IStore/IAuthentication";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("room/set-user-id");
const handleMessageSocket = createAction<IMessage>("room/socket:handle-message");
const handlePinnedMessageSocket = createAction<TPinnedMessagesSocket>("room/socket:handle-pinned-message");
const handleEditedMessageSocket = createAction<IEditedMessageSocket>("room/socket:handle-edited-message");
const handleDeletedMessageSocket = createAction<IDeletedMessageSocket>("room/socket:handle-deleted-message");
const handleForwardedMessageSocket = createAction<IForwardedMessage>("room/socket:handle-forwarded-message");
const handleChangeUserTypingSocket = createAction<IParticipant[]>("room/socket:room:handle-toggle-typing");

export {
    setUserId,
    handleMessageSocket,
    handlePinnedMessageSocket,
    handleEditedMessageSocket,
    handleDeletedMessageSocket,
    handleForwardedMessageSocket,
    handleChangeUserTypingSocket
};