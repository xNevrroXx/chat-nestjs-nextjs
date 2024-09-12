import { useCallback } from "react";
import { editMessageSocket, sendMessageSocket } from "@/store/thunks/room";
import { useAppDispatch } from "@/hooks/store.hook";
import {
    FileType,
    RoomType,
    TPreviewRoomWithFlag,
    TRoomWithPreviewFlag,
    TSendMessage,
} from "@/models/room/IRoom.store";
import type { TValueOf } from "@/models/TUtils";
import { useFetch } from "@/hooks/useFetch.hook";
import {
    MessageAction,
    TMessageForEditOrReply,
} from "@/models/room/IRoom.general";
import { UploadFile } from "antd";
import { joinRoomAndSetActive } from "@/store/thunks/recent-rooms";

interface IProps {
    beforeSendingCb: () => void;
    afterSendingCb: () => void;
    room: TPreviewRoomWithFlag | TRoomWithPreviewFlag;
    messageForAction: TMessageForEditOrReply | undefined | null;
}

const useSendMessage = ({
    beforeSendingCb,
    afterSendingCb,
    messageForAction,
    room,
}: IProps) => {
    const dispatch = useAppDispatch();
    const { request } = useFetch<{ id: string }>(
        process.env.NEXT_PUBLIC_BASE_URL + "/file/upload",
    );

    const onJoinRoomAndSetActive = useCallback(async () => {
        return await dispatch(
            joinRoomAndSetActive({
                id: room.id,
                type: room.type,
                wasMember: room.isPreview ? room.wasMember : false,
            }),
        ).unwrap();
    }, [dispatch, room]);

    const sendEditedMessage = useCallback(
        (text: string) => {
            if (!messageForAction) {
                return;
            }

            beforeSendingCb();

            void dispatch(
                editMessageSocket({
                    messageId: messageForAction.message.id,
                    text: text,
                }),
            );

            afterSendingCb();
        },
        [afterSendingCb, beforeSendingCb, dispatch, messageForAction],
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
                replyToMessageId: messageForAction?.message.id,
            };

            let message: TSendMessage;
            if (room.isPreview && room.type === RoomType.PRIVATE) {
                const newRoom = await onJoinRoomAndSetActive();
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
                    roomId: room.id,
                    ...messageWithoutRoomId,
                };
            }

            void dispatch(sendMessageSocket(message));

            afterSendingCb();
        },
        [
            room,
            dispatch,
            afterSendingCb,
            beforeSendingCb,
            messageForAction,
            onJoinRoomAndSetActive,
        ],
    );

    const sendVoiceMessage = useCallback(
        async (record: Blob) => {
            const file = new File([record], "", {
                type: "audio/webm",
            });

            const formData = new FormData();
            formData.set("roomId", room.id);
            formData.set("file", file, "set-random");
            formData.set("fileType", FileType.VOICE_RECORD);

            const response = await request({
                method: "POST",
                data: formData,
                withCredentials: true,
            });

            if (!response) {
                return;
            }
            void sendStandardMessage(null, [response.id]);
        },
        [request, room.id, sendStandardMessage],
    );

    const sendMessage = useCallback(
        (text: string, fileList: UploadFile[]) => {
            beforeSendingCb();

            if (
                messageForAction &&
                messageForAction.action === MessageAction.EDIT
            ) {
                sendEditedMessage(text);
                afterSendingCb();
                return;
            }

            if (fileList.some((file) => file.status === "uploading")) {
                return;
            }

            const trimmedMessage = text ? text.trim() : null;

            const attachmentIds = fileList.map<string>(
                (file) => (file.response as { id: string }).id,
            );

            void sendStandardMessage(trimmedMessage, attachmentIds);

            afterSendingCb();
        },
        [
            afterSendingCb,
            beforeSendingCb,
            messageForAction,
            sendEditedMessage,
            sendStandardMessage,
        ],
    );

    return {
        sendVoiceMessage,
        sendMessage,
    };
};

export { useSendMessage };
