import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IOriginalMessage,
} from "@/models/room/IRoom.store";

const findMessageSelector = createSelector(
    [
        (state: TRootState) => state.room.local,
        (state: TRootState) => state.room.previews,
        (
            _,
            data: {
                roomId: string;
                messageBriefInfo: {
                    id: string;
                    date: string;
                };
            },
        ) => data,
    ],
    (
        localRooms,
        previewRooms,
        { roomId, messageBriefInfo },
    ):
        | IInnerStandardMessage
        | IInnerForwardedMessage
        | IOriginalMessage
        | null => {
        const localRoom = localRooms.rooms.byId[roomId];
        if (localRoom) {
            const message = localRoom.days[messageBriefInfo.date].find(
                (msg) => msg.id === messageBriefInfo.id,
            );

            return message || null;
        }

        const previewRoom = previewRooms.rooms.find(
            (room) => room.id === roomId,
        );
        if (previewRoom) {
            const message = previewRoom.days[messageBriefInfo.date].find(
                (msg) => msg.id === messageBriefInfo.id,
            );

            return message || null;
        }

        console.log("HERE 2");
        return null;
    },
);

export { findMessageSelector };
