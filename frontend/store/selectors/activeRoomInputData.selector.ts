import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import {
    IRecentRoomInputStandard,
    IRecentRoomInputWithVoiceRecord,
} from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    IRoom,
} from "@/models/room/IRoom.store";
import { MessageAction } from "@/models/room/IRoom.general";
import { DATE_FORMATTER_SHORT } from "@/utils/normalizeDate";

type TResult = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    isPreview: boolean;
    input: {
        messageForAction:
            | {
                  message: IInnerStandardMessage | IInnerForwardedMessage;
                  action: MessageAction;
              }
            | undefined
            | null;
    } & (IRecentRoomInputWithVoiceRecord | IRecentRoomInputStandard);
};

const activeRoomInputDataSelector = createSelector(
    [
        (state: TRootState) => state.recentRooms,
        (state: TRootState) => state.room,
    ],
    (recentRoomSlice, roomSlice): TResult | undefined => {
        const currentRoomId = recentRoomSlice.currentRoomId;
        if (!currentRoomId || !recentRoomSlice.allIds.includes(currentRoomId)) {
            return;
        }

        const messageInfo =
            recentRoomSlice.rooms.byId[currentRoomId].input.messageForAction;

        if (!messageInfo) {
            return recentRoomSlice.rooms.byId[currentRoomId] as TResult;
        }

        const messageFullInfo = roomSlice.local.rooms.byId[currentRoomId].days[
            DATE_FORMATTER_SHORT.format(new Date(messageInfo.message.createdAt))
        ].find((msg) => msg.id === messageInfo.message.id)!;

        return {
            ...recentRoomSlice.rooms.byId[currentRoomId],
            input: {
                ...recentRoomSlice.rooms.byId[currentRoomId].input,
                messageForAction: {
                    ...recentRoomSlice.rooms.byId[currentRoomId].input
                        .messageForAction!,
                    message: messageFullInfo,
                },
            },
        };
    },
);

export { activeRoomInputDataSelector };
