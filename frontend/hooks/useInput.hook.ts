import { useCallback, useEffect, useState } from "react";
import { UploadFile } from "antd";
import { useOnTyping } from "@/hooks/useOnTyping.hook";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import { usePrevious } from "@/hooks/usePrevious";
import { activeRoomInputDataSelector } from "@/store/selectors/activeRoomInputData.selector";
import { useAudioRecorder } from "@/hooks/useAudioRecorder.hook";
import { useSendMessage } from "@/hooks/useSendMessage.hook";
import { updateRecentRoomData } from "@/store/actions/recent-rooms";
import { isSpecialKey } from "@/utils/checkIsNotSpecialKey";
import { MessageAction } from "@/models/room/IRoom.general";
import { TValueOf } from "@/models/TUtils";
import { TUpdateInputData } from "@/models/recent-rooms/IRecentRooms.store";
import {
    updateMessageForAction,
    updateRecentMessage,
} from "@/store/thunks/recent-rooms";
import { usePreviousRenderState } from "@/hooks/usePreviousRender.hook";

const useInput = () => {
    const dispatch = useAppDispatch();
    const activeRoom = useAppSelector(activeRoomSelector)!;
    const previousRoomId = usePrevious(activeRoom.id);
    const previousRenderRoomId = usePreviousRenderState(activeRoom.id);
    const storedInputInfo = useAppSelector(activeRoomInputDataSelector);
    const [messageText, setMessageText] = useState<string>("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const audioRecorder = useAudioRecorder();

    const updateRecentMessageOnServer = useCallback(
        (roomId: string) => {
            const messageForAction =
                storedInputInfo && storedInputInfo.input.messageForAction;

            void dispatch(
                updateRecentMessage({
                    roomId: roomId,
                    text: messageText,
                    messageForAction: messageForAction && {
                        id: messageForAction.message.id,
                        action: messageForAction.action,
                    },
                }),
            );
        },
        [dispatch, messageText, storedInputInfo],
    );
    const { onTyping, resetDebouncedOnTypingFunction } = useOnTyping({
        roomId: activeRoom.id,
        isPreviewRoom: activeRoom.isPreview,
        extraFnOnResetDebounced: updateRecentMessageOnServer,
    });
    const { sendMessage, sendVoiceMessage } = useSendMessage({
        beforeSendingCb: resetDebouncedOnTypingFunction,
        afterSendingCb: () => {
            void dispatch(
                updateMessageForAction({
                    messageForAction: null,
                    roomId: activeRoom.id,
                }),
            );
            setMessageText("");
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

    const onChangeMessage = useCallback((str: string) => {
        setMessageText(str);
    }, []);

    const onKeyDown = (event: KeyboardEvent) => {
        if (
            event.key !== "Enter" ||
            !(event.target instanceof HTMLDivElement) ||
            !messageText ||
            messageText.length === 0
        ) {
            if (!isSpecialKey(event)) {
                onTyping();
            }
            return;
        }

        void sendMessage(messageText, fileList);
    };

    useEffect(() => {
        if (
            !storedInputInfo ||
            !storedInputInfo.input.messageForAction ||
            storedInputInfo.input.messageForAction.action !== MessageAction.EDIT
        ) {
            return;
        }

        onChangeMessage(
            storedInputInfo.input.messageForAction.message.text || "",
        );
    }, [storedInputInfo, onChangeMessage]);

    const updateInputStates = useCallback(() => {
        if (!activeRoom.id || !storedInputInfo) {
            return;
        }
        onChangeMessage("");
        audioRecorder.cleanAudio();
        setFileList([]);

        const inputData = storedInputInfo.input;
        if (inputData.isAudioRecord) {
            audioRecorder.manualSetAudioData(inputData.blob);
        }
        else {
            onChangeMessage(inputData.text);
        }
    }, [activeRoom.id, audioRecorder, onChangeMessage, storedInputInfo]);

    const updateInputStore = useCallback(
        ({
            roomId,
            audio,
            audioURL,
            messageText,
        }: {
            roomId: string;
            messageText: string;
            audio: Blob | null;
            audioURL: string | null;
        }) => {
            if (!roomId) {
                return;
            }
            let inputData: TValueOf<Pick<TUpdateInputData, "input">>;

            if (audio && audioURL) {
                inputData = {
                    isAudioRecord: true,
                    blob: audio,
                    url: audioURL,
                };
            }
            else {
                inputData = {
                    isAudioRecord: false,
                    text: messageText,
                    files: [],
                };
            }

            dispatch(
                updateRecentRoomData({
                    id: roomId,
                    input: inputData,
                }),
            );

            void dispatch(
                updateRecentMessage({
                    roomId: roomId,
                    text: messageText,
                }),
            );
        },
        [dispatch],
    );

    useEffect(() => {
        if (activeRoom.id === previousRenderRoomId) {
            return;
        }

        updateInputStates();
        return () =>
            updateInputStore({
                messageText,
                roomId: previousRenderRoomId,
                audio: audioRecorder.audio,
                audioURL: audioRecorder.audioURL,
            });
    }, [
        activeRoom.id,
        audioRecorder.audio,
        audioRecorder.audioURL,
        messageText,
        previousRenderRoomId,
        storedInputInfo,
        updateInputStates,
        updateInputStore,
    ]);

    const removeMessageForAction = useCallback(() => {
        void dispatch(
            updateMessageForAction({
                messageForAction: null,
                roomId: activeRoom.id,
            }),
        );
    }, [activeRoom.id, dispatch]);

    return {
        // data
        activeRoom,
        previousRoomId,
        storedInputInfo,
        messageText,
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
        // audio recorded
        audioRecorder,
    };
};

export { useInput };
