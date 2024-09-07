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
                messageBriefInfo:
                    | {
                          id: string;
                          date: string;
                      }
                    | undefined
                    | null;
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
        if (!messageBriefInfo) {
            return null;
        }

        const localRoom = localRooms.rooms.byId[roomId];
        if (localRoom) {
            const message = (localRoom.days[messageBriefInfo.date] || []).find(
                (msg) => msg.id === messageBriefInfo.id,
            );

            if (message) {
                return message;
            }
            else if (
                !message &&
                forwardedMessages.allIds.includes(messageBriefInfo.id)
            ) {
                return forwardedMessages.byId[messageBriefInfo.id];
            }
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

        return null;
    },
);

export { findMessageSelector };
