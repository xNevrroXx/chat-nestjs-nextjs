import { FC, useEffect, useRef, useState } from "react";
import { Button, Flex, UploadFile } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
// own modules
import InputDuringMessage from "@/components/InputDuringMessage/InputDuringMessage";
import InputDuringAudio from "@/components/InputDuringAudio/InputDuringAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder.hook";
import { isSpecialKey } from "@/utils/checkIsNotSpecialKey";
import { IEditMessage, TSendMessage } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
// styles
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { activeRoomInputDataSelector } from "@/store/selectors/activeRoomInputData.selector";
import { updateRecentRoomData } from "@/store/actions/recentRooms";
import { IRecentRoom } from "@/models/recent-rooms/IRecentRooms.store";
import { usePrevious } from "@/hooks/usePrevious";
import {
    MessageAction,
    TMessageForAction,
    TMessageForActionEditOrReply,
} from "@/models/room/IRoom.general";
import { DATE_FORMATTER_SHORT } from "@/utils/normalizeDate";
import SubMessage from "@/components/SubMessage/SubMessage";
// styles
import "./input-message.scss";

interface IInputMessage {
    onSendMessage: (
        text: TValueOf<Pick<TSendMessage, "text">>,
        attachmentIds: string[],
    ) => void;
    onSendVoiceMessage: (record: Blob) => void;
    onSendEditedMessage: (text: TValueOf<Pick<IEditMessage, "text">>) => void;
    onTyping: () => void;
    messageForAction: TMessageForActionEditOrReply | null;
    removeMessageForAction: () => void;
    changeMessageForAction: (
        messageForAction: TMessageForAction | null,
    ) => void;
}

const InputMessage: FC<IInputMessage> = ({
    onTyping,
    messageForAction,
    onSendMessage,
    onSendVoiceMessage,
    onSendEditedMessage,
    changeMessageForAction,
    removeMessageForAction,
}) => {
    const dispatch = useAppDispatch();
    const currentRoomId = useAppSelector(
        (state) => state.recentRooms.currentRoomId,
    );
    const previousRoomId = usePrevious(currentRoomId);
    const initialInputInfo = useAppSelector(activeRoomInputDataSelector);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState<string>("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const {
        mediaRecorder,
        isRecording,
        audio,
        audioURL,
        startRecording,
        stopRecording,
        cleanAudio,
        manualSetAudioData,
    } = useAudioRecorder();

    useEffect(() => {
        // save current input data to the global store
        if (!previousRoomId || previousRoomId === currentRoomId) {
            return;
        }
        let inputData: TValueOf<Pick<IRecentRoom, "input">>;

        if (audio && audioURL) {
            inputData = {
                isAudioRecord: true,
                blob: audio,
                url: audioURL,
                messageForAction: messageForAction,
            };
        }
        else {
            inputData = {
                isAudioRecord: false,
                text: message,
                files: fileList,
                messageForAction: messageForAction,
            };
        }

        dispatch(
            updateRecentRoomData({
                id: previousRoomId,
                input: inputData,
            }),
        );
    }, [
        audio,
        audioURL,
        currentRoomId,
        dispatch,
        fileList,
        message,
        messageForAction,
        previousRoomId,
    ]);

    useEffect(() => {
        // update input state in the current chat (load from the global store)
        if (currentRoomId === previousRoomId || !initialInputInfo) {
            return;
        }
        setMessage("");
        cleanAudio();

        const inputData = initialInputInfo.input;
        switch (inputData.isAudioRecord) {
            case true: {
                manualSetAudioData(inputData.blob);
                break;
            }
            case false: {
                setMessage(inputData.text);
                break;
            }
        }

        changeMessageForAction(inputData.messageForAction);
    }, [
        initialInputInfo,
        setMessage,
        manualSetAudioData,
        previousRoomId,
        currentRoomId,
        cleanAudio,
        messageForAction,
        changeMessageForAction,
    ]);

    useEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.focus();
    }, [messageForAction]);

    useEffect(() => {
        if (
            !inputRef.current ||
            !messageForAction ||
            messageForAction.action !== MessageAction.EDIT
        ) {
            return;
        }

        setMessage(messageForAction.message.text || "");
    }, [messageForAction]);

    const updateFiles = (files: UploadFile[]) => {
        setFileList(files);
    };

    const onChangeMessage = (str: string) => {
        setMessage(str);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (
            event.key !== "Enter" ||
            !(event.target instanceof HTMLDivElement) ||
            !message ||
            message.length === 0
        ) {
            if (!isSpecialKey(event)) {
                onTyping();
            }
            return;
        }

        void sendMessage();
    };

    const sendMessage = () => {
        if (
            messageForAction &&
            messageForAction.action === MessageAction.EDIT
        ) {
            onSendEditedMessage(message);
            setMessage("");
            return;
        }

        if (fileList.some((file) => file.status === "uploading")) {
            return;
        }

        const trimmedMessage = message ? message.trim() : null;

        const attachmentIds = fileList.map<string>(
            (file) => (file.response as { id: string }).id,
        );

        onSendMessage(trimmedMessage, attachmentIds);
        setMessage("");
        updateFiles([]);
    };

    return (
        <>
            <Flex
                className="input-message"
                justify="space-between"
                vertical
                align="self-start"
                gap="small"
            >
                {messageForAction && currentRoomId && (
                    <Flex align="center">
                        <SubMessage
                            isInput={true}
                            roomId={currentRoomId}
                            messageBriefInfo={{
                                id: messageForAction.message.id,
                                date: DATE_FORMATTER_SHORT.format(
                                    new Date(
                                        messageForAction.message.createdAt,
                                    ),
                                ),
                            }}
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={removeMessageForAction}
                        />
                    </Flex>
                )}
                {isRecording || audioURL ? (
                    <InputDuringAudio
                        audio={audio}
                        mediaRecorder={mediaRecorder.current}
                        stopRecording={stopRecording}
                        cleanAudio={cleanAudio}
                        isRecording={isRecording}
                        audioURL={audioURL}
                        sendVoiceMessage={onSendVoiceMessage}
                    />
                ) : (
                    <InputDuringMessage
                        ref={inputRef}
                        message={message}
                        sendMessage={sendMessage}
                        onKeyDown={onKeyDown}
                        isRecording={isRecording}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        updateFileList={updateFiles}
                        fileList={fileList}
                        onChange={onChangeMessage}
                    />
                )}
            </Flex>
        </>
    );
};

export default InputMessage;
