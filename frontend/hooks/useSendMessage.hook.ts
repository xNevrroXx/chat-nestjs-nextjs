import { useCallback } from "react";
import { editMessageSocket, sendMessageSocket } from "@/store/thunks/room";
import { useAppDispatch } from "@/hooks/store.hook";
import {
    FileType,
    IOriginalMessage,
    IRoom,
    RoomType,
    TPreviewRoomWithFlag,
    TSendMessage,
} from "@/models/room/IRoom.store";
import type { TValueOf } from "@/models/TUtils";
import { useFetch } from "@/hooks/useFetch.hook";

interface IProps {
    beforeSendingCb: () => void;
    afterSendingCb: () => void;
    isPreviewRoom: boolean;
    roomType: RoomType;
    roomId: TValueOf<Pick<IRoom, "id">>;
    messageId: TValueOf<Pick<IOriginalMessage, "id">> | null;
    onJoinRoom: (
        roomId: TValueOf<Pick<TPreviewRoomWithFlag, "id">>,
    ) => Promise<IRoom | undefined>;
}

const useSendMessage = ({
    beforeSendingCb,
    afterSendingCb,
    isPreviewRoom,
    onJoinRoom,
    messageId,
    roomType,
    roomId,
}: IProps) => {
    const dispatch = useAppDispatch();
    const { request } = useFetch<{ id: string }>(
        process.env.NEXT_PUBLIC_BASE_URL + "/file/upload",
    );

    const sendEditedMessage = useCallback(
        (text: string) => {
            if (!messageId) {
                return;
            }

            beforeSendingCb();

            void dispatch(
                editMessageSocket({
                    messageId: messageId,
                    text: text,
                }),
            );

            afterSendingCb();
        },
        [afterSendingCb, beforeSendingCb, dispatch, messageId],
    );

    const sendStandardMessage = useCallback(
        async (
            text: TValueOf<Pick<TSendMessage, "text">>,
            attachmentIds: string[],
        ) => {
            beforeSendingCb();

            const messageWithoutRoomId: Omit<TSendMessage, "roomId"> = {
                text,
                attachmentIds,
                replyToMessageId: messageId,
            };

            let message: TSendMessage;
            if (isPreviewRoom && roomType === RoomType.PRIVATE) {
                const newRoom = await onJoinRoom(roomId);
                if (!newRoom) {
                    return;
                }
                message = {
                    roomId: newRoom.id,
                    ...messageWithoutRoomId,
                };
            }
            else {
                message = {
                    roomId,
                    ...messageWithoutRoomId,
                };
            }

            void dispatch(sendMessageSocket(message));

            afterSendingCb();
        },
        [
            afterSendingCb,
            beforeSendingCb,
            dispatch,
            isPreviewRoom,
            messageId,
            onJoinRoom,
            roomId,
            roomType,
        ],
    );

    const sendVoiceMessage = useCallback(
        async (record: Blob) => {
            const file = new File([record], "", {
                type: "audio/webm",
            });

            const formData = new FormData();
            formData.set("file", file, "set-random");
            formData.set("roomId", roomId);
            formData.set("fileType", FileType.VOICE_RECORD);

            const response = await request({ method: "POST", data: formData });

            if (!response) {
                return;
            }
            void sendStandardMessage(null, [response.id]);
        },
        [request, roomId, sendStandardMessage],
    );

    const forwardMessage = useCallback(() => {}, []);

    return {
        sendStandardMessage,
        sendEditedMessage,
        sendVoiceMessage,
        forwardMessage,
    };
};

export { useSendMessage };
