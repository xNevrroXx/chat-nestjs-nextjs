import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { UploadFile } from "antd";
import { useOnTyping } from "@/hooks/useOnTyping.hook";
import { useAppSelector } from "@/hooks/store.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import { usePrevious } from "@/hooks/usePrevious";
import { activeRoomInputDataSelector } from "@/store/selectors/activeRoomInputData.selector";
import { useAudioRecorder } from "@/hooks/useAudioRecorder.hook";
import { useSendMessage } from "@/hooks/useSendMessage.hook";
import {
    updateMessageForAction,
    updateRecentRoomData,
} from "@/store/actions/recent-rooms";
import { isSpecialKey } from "@/utils/checkIsNotSpecialKey";
import { MessageAction } from "@/models/room/IRoom.general";
import { TValueOf } from "@/models/TUtils";
import { TUpdateInputData } from "@/models/recent-rooms/IRecentRooms.store";

const useInput = () => {
    const dispatch = useDispatch();
    const activeRoom = useAppSelector(activeRoomSelector)!;
    const previousRoomId = usePrevious(activeRoom.id);
    const storedInputInfo = useAppSelector(activeRoomInputDataSelector);

    const [messageText, setMessageText] = useState<string>("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const audioRecorder = useAudioRecorder();
    const { onTyping, resetDebouncedOnTypingFunction } = useOnTyping({
        roomId: activeRoom.id,
        isPreviewRoom: activeRoom.isPreview,
    });
    const { sendMessage, sendVoiceMessage } = useSendMessage({
        beforeSendingCb: resetDebouncedOnTypingFunction,
        afterSendingCb: () => {
            dispatch(updateMessageForAction({ messageForAction: null }));
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

    const updateInputStore = useCallback(() => {
        if (!activeRoom.id || !previousRoomId) {
            return;
        }
        let inputData: TValueOf<Pick<TUpdateInputData, "input">>;

        if (audioRecorder.audio && audioRecorder.audioURL) {
            inputData = {
                isAudioRecord: true,
                blob: audioRecorder.audio,
                url: audioRecorder.audioURL,
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
                id: previousRoomId,
                input: inputData,
            }),
        );
    }, [
        activeRoom.id,
        audioRecorder.audio,
        audioRecorder.audioURL,
        dispatch,
        messageText,
        previousRoomId,
    ]);

    useEffect(() => {
        // update input state in the current chat (load from the global store)

        updateInputStates();
        updateInputStore();
    }, [activeRoom.id]);

    const removeMessageForAction = useCallback(() => {
        dispatch(updateMessageForAction({ messageForAction: null }));
    }, [dispatch]);

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
