import { FC, useEffect, useRef, useState } from "react";
import { Button, Flex } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import useFileUpload from "react-use-file-upload";
// own modules
import InputDuringMessage from "@/components/InputDuringMessage/InputDuringMessage";
import InputDuringAudio from "@/components/InputDuringAudio/InputDuringAudio";
import { useAudioRecorder } from "@/hooks/useAudioRecorder.hook";
import { isSpecialKey } from "@/utils/checkIsNotSpecialKey";
import {
    FileType,
    IAttachment,
    IEditMessage,
    TSendMessage,
} from "@/models/room/IRoom.store";
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
import "./input-message.scss";

interface IInputMessage {
    onSendMessage: (
        text: TValueOf<Pick<TSendMessage, "text">>,
        attachments: IAttachment[],
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
    const { files, clearAllFiles, setFiles, removeFile } = useFileUpload();
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
                files: files,
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
        files,
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

        inputRef.current?.focus();
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
        setMessage("");
    };

    const sendMessage = async () => {
        if (
            messageForAction &&
            messageForAction.action === MessageAction.EDIT
        ) {
            onSendEditedMessage(message);
            setMessage("");
            return;
        }

        const trimmedMessage = message ? message.trim() : null;
        const attachments = await files.reduce<Promise<IAttachment[]>>(
            async (previousValue, currentValue) => {
                const prev = await previousValue;
                const extensionInfo =
                    currentValue.name.match(/(?<=\.)\D+$/) || [];
                const extension =
                    extensionInfo.length === 1 ? extensionInfo[0] : "";

                prev.push({
                    originalName: currentValue.name,
                    fileType: FileType.ATTACHMENT,
                    mimeType: currentValue.type,
                    extension: extension,
                    buffer: await currentValue.arrayBuffer(),
                });
                return prev;
            },
            Promise.all([]),
        );

        onSendMessage(trimmedMessage, attachments);
        setMessage("");
        clearAllFiles();
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
                        files={files}
                        setFiles={setFiles}
                        removeFile={removeFile}
                        onChange={onChangeMessage}
                    />
                )}
            </Flex>
        </>
    );
};

export default InputMessage;
