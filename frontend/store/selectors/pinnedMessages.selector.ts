import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { TValueOf } from "@/models/TUtils";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IOriginalMessage,
    IRoom,
} from "@/models/room/IRoom.store";

const pinnedMessagesSelector = createSelector(
    [
        (state: TRootState) => state.room.local,
        (state: TRootState) => state.room.previews,
        (_, roomId: TValueOf<Pick<IRoom, "id">>) => roomId,
    ],
    (
        localRooms,
        previewRooms,
        targetRoomId,
    ): (
        | IInnerStandardMessage
        | IInnerForwardedMessage
        | IOriginalMessage
    )[] => {
        if (localRooms.allIds.includes(targetRoomId)) {
            const room = localRooms.rooms.byId[targetRoomId];

            const pinnedMessages = room.pinnedMessages;
            return pinnedMessages
                .map((pinnedMsgInfo) => {
                    return room.days[pinnedMsgInfo.message.date].find(
                        (msg) => msg.id === pinnedMsgInfo.message.id,
                    )!;
                })
                .filter((msg) => !msg.isDeleted);
        }

        const previewRoom = previewRooms.rooms.find(
            (previewRoom) => previewRoom.id === targetRoomId,
        );
        if (previewRoom) {
            const pinnedMessages = previewRoom.pinnedMessages;
            return pinnedMessages
                .map((pinnedMsgInfo) => {
                    return previewRoom.days[pinnedMsgInfo.message.date].find(
                        (msg) => msg.id === pinnedMsgInfo.message.id,
                    )!;
                })
                .filter((msg) => !msg.isDeleted);
        }

        return [];
    },
);

export { pinnedMessagesSelector };
