import { createAction } from "@reduxjs/toolkit";
import {
    IRoom,
    IMessage,
    IParticipant,
    IForwardedMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
import {
    TAddRoom,
    TExcludeRoom,
} from "@/models/rooms-on-folders/IRoomOnFolders.store";

const excludeFromFolder = createAction<TExcludeRoom>(
    "room/exclude-from-folder",
);
const addOnFolder = createAction<TAddRoom>("room/add-on-folder");
const setUserId =
    createAction<TValueOf<Pick<IUserDto, "id">>>("room/set-user-id");
const clearPreviewRooms = createAction("room/clear-previews");
const addOrUpdateRoomSocket = createAction<IRoom>("room/add-or-update");
const handleMessageSocket = createAction<IMessage>(
    "room/socket:handle-message",
);
const handlePinnedMessageSocket = createAction<TPinnedMessagesSocket>(
    "room/socket:handle-pinned-message",
);
const handleEditedMessageSocket = createAction<IEditedMessageSocket>(
    "room/socket:handle-edited-message",
);
const handleDeletedMessageSocket = createAction<IDeletedMessageSocket>(
    "room/socket:handle-deleted-message",
);
const handleForwardedMessageSocket = createAction<IForwardedMessage>(
    "room/socket:handle-forwarded-message",
);
const handleChangeUserTypingSocket = createAction<IParticipant[]>(
    "room/socket:room:handle-toggle-typing",
);

export {
    setUserId,
    clearPreviewRooms,
    handleMessageSocket,
    addOrUpdateRoomSocket,
    handlePinnedMessageSocket,
    handleEditedMessageSocket,
    handleDeletedMessageSocket,
    handleForwardedMessageSocket,
    handleChangeUserTypingSocket,
    addOnFolder as addRoomOnFolder,
    excludeFromFolder as excludeRoomFromFolder,
};
