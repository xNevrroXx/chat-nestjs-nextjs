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
        (state: TRootState) => state.room.forwardedMessages,
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
        forwardedMessages,
        { roomId, messageBriefInfo },
    ):
        | IInnerStandardMessage
        | IInnerForwardedMessage
        | IOriginalMessage
        | null => {
        const localRoom = localRooms.rooms.byId[roomId];

        if (!localRoom || !messageBriefInfo.date || !messageBriefInfo.id) {
            return null;
        }

        let message:
            | IInnerStandardMessage
            | IInnerForwardedMessage
            | IOriginalMessage
            | undefined = (localRoom.days[messageBriefInfo.date] || []).find(
            (msg) => msg.id === messageBriefInfo.id,
        );

        if (
            !message &&
            forwardedMessages.allIds.includes(messageBriefInfo.id)
        ) {
            message = forwardedMessages.byId[messageBriefInfo.id];
        }

        return message || null;
    },
);

export { findMessageSelector };
