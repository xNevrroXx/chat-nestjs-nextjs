import { createAction } from "@reduxjs/toolkit";
import {
    IRecentRoomInputWithMessageForAction,
    IRecentRoomInputWithVoiceRecord,
    IRecentRoomInputStandard,
    TAddRecentRoomData,
} from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import { IFile, IRoom } from "@/models/room/IRoom.store";
import { THandleRecentMessage } from "@/models/recent-rooms/recent-rooms.response";

const update = createAction<{
    input: Partial<IRecentRoomInputWithMessageForAction> &
        (
            | IRecentRoomInputWithVoiceRecord
            | Omit<IRecentRoomInputStandard, "uploadedFiles">
        ) & { uploadedFiles?: IFile[] };
}>("recent-rooms/update-input");

const remove = createAction<TValueOf<Pick<IRoom, "id">>>(
    "recent-rooms/remove-by-id",
);
const reset = createAction<void>("recent-rooms/reset");
const add = createAction<TAddRecentRoomData>("recent-rooms/add");

const handleRecentMessage = createAction<THandleRecentMessage>(
    "recent-rooms/socket:update-room-input",
);

export {
    update as updateRecentRoomData,
    remove as removeRecentRoomData,
    reset as resetCurrentRoomId,
    add as addRecentRoomData,
    handleRecentMessage,
};
