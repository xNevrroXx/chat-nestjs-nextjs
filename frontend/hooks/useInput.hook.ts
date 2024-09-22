import { useCallback, useEffect, useState } from "react";
import { UploadFile } from "antd";
import { useOnTyping } from "@/hooks/useOnTyping.hook";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import { usePrevious } from "@/hooks/usePrevious";
import { activeRoomInputDataSelector } from "@/store/selectors/activeRoomInputData.selector";
import { useAudioRecorder } from "@/hooks/useAudioRecorder.hook";
import { useSendMessage } from "@/hooks/useSendMessage.hook";
import { isSpecialKey } from "@/utils/checkIsNotSpecialKey";
import {
    deleteUploadedFile,
    updateMessageForAction,
    updateOnServerRecentRoomData,
} from "@/store/thunks/recent-rooms";
import { usePreviousRenderState } from "@/hooks/usePreviousRender.hook";
import { updateRecentRoomData } from "@/store/actions/recent-rooms";
import { checkIsUploadedFile, IFile } from "@/models/room/IRoom.store";

const useInput = () => {
    const dispatch = useAppDispatch();
    const activeRoom = useAppSelector(activeRoomSelector)!;
    const previousRoomId = usePrevious(activeRoom.id);
    const previousRenderRoomId = usePreviousRenderState(activeRoom.id);
    const storedInputInfo = useAppSelector(activeRoomInputDataSelector)!;
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const audioRecorder = useAudioRecorder({
        onStopCb: (blob, url) => {
            dispatch(
                updateRecentRoomData({
                    input: {
                        isAudioRecord: true,
                        blob,
                        url,
                    },
                }),
            );
        },
        onCleanAudioCb: () => {
            dispatch(
                updateRecentRoomData({
                    input: {
                        isAudioRecord: false,
                        text: "",
                        files: [],
                        uploadedFiles: [],
                    },
                }),
            );
        },
    });

    const { onTyping, resetDebouncedOnTypingFunction } = useOnTyping({
        roomId: activeRoom.id,
        isPreviewRoom: activeRoom.isPreview,
    });
    const { sendMessage, sendVoiceMessage } = useSendMessage({
        beforeSendingCb: resetDebouncedOnTypingFunction,
        afterSendingCb: () => {
            dispatch(
                updateRecentRoomData({
                    input: {
                        isAudioRecord: false,
                        text: "",
                        files: [],
                        uploadedFiles: [],
                        messageForAction: null,
                    },
                }),
            );
            setFileList([]);
            audioRecorder.cleanAudio();
        },
        room: activeRoom,
        messageForAction:
            storedInputInfo && storedInputInfo.input.messageForAction,
    });

    const updateFiles = useCallback((files: UploadFile[]) => {
        setFileList(files);
    }, []);

    const onChangeMessage = useCallback(
        (str: string) => {
            dispatch(
                updateRecentRoomData({
                    input: {
                        isAudioRecord: false,
                        text: str,
                        files: [],
                    },
                }),
            );
        },
        [dispatch],
    );

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (
                event.key !== "Enter" ||
                (!storedInputInfo.input.isAudioRecord &&
                    !storedInputInfo.input.text)
            ) {
                if (!isSpecialKey(event)) {
                    onTyping();
                }
                return;
            }

            if (storedInputInfo.input.isAudioRecord) {
                void sendVoiceMessage(storedInputInfo.input.blob);
                return;
            }
            void sendMessage(storedInputInfo.input.text, fileList);
        },
        [
            fileList,
            onTyping,
            sendMessage,
            sendVoiceMessage,
            storedInputInfo.input,
        ],
    );

    useEffect(() => {
        if (storedInputInfo.roomId === previousRenderRoomId) {
            return;
        }
        setFileList([]);

        const inputData = storedInputInfo.input;
        if (inputData.isAudioRecord) {
            audioRecorder.manualSetAudioData(inputData.blob);
        }

        return () => {
            void dispatch(
                updateOnServerRecentRoomData({
                    roomId: previousRenderRoomId,
                }),
            );
        };
    }, [dispatch, storedInputInfo, previousRenderRoomId, audioRecorder]);

    const removeMessageForAction = useCallback(() => {
        void dispatch(
            updateMessageForAction({
                messageForAction: null,
                roomId: activeRoom.id,
            }),
        );
    }, [activeRoom.id, dispatch]);

    const removeFile = useCallback(
        async (file: UploadFile | IFile) => {
            await dispatch(
                deleteUploadedFile({
                    fileId: checkIsUploadedFile(file)
                        ? file.id
                        : (file.response as { id: string }).id,
                }),
            );
        },
        [dispatch],
    );

    return {
        // data
        activeRoom,
        previousRoomId,
        storedInputInfo,
        messageText:
            (!storedInputInfo.input.isAudioRecord &&
                storedInputInfo.input.text) ||
            "",
        uploadedFiles:
            (!storedInputInfo.input.isAudioRecord &&
                storedInputInfo.input.uploadedFiles) ||
            [],
        fileList,
        // sending actions
        sendMessage,
        sendVoiceMessage,
        // message actions
        onKeyDown,
        onChangeMessage,
        removeMessageForAction,
        // attachment actions
        updateFiles,
        removeFile,
        // audio recorded
        audioRecorder,
    };
};

export { useInput };
