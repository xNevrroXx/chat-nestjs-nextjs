import { FC, useEffect, useRef } from "react";
import { Button, Flex } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
// own modules
import InputDuringMessage from "@/components/InputDuringMessage/InputDuringMessage";
import InputDuringAudio from "@/components/InputDuringAudio/InputDuringAudio";
import SubMessage from "@/components/SubMessage/SubMessage";
import { DATE_FORMATTER_SHORT } from "@/utils/normalizeDate";
import { useInput } from "@/hooks/useInput.hook";
// styles
import "./input-message.scss";

interface IInputMessage {}

const InputMessage: FC<IInputMessage> = () => {
    const inputRef = useRef<HTMLDivElement | null>(null);
    const {
        // data
        activeRoom,
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
        audioRecorder: {
            mediaRecorder,
            isRecording,
            audio,
            audioURL,
            startRecording,
            stopRecording,
            cleanAudio,
        },
    } = useInput();

    useEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.focus();
    }, [storedInputInfo?.input]);

    return (
        <Flex
            className="input-message"
            justify="space-between"
            vertical
            align="self-start"
            gap="small"
        >
            {storedInputInfo && storedInputInfo.input.messageForAction && (
                <Flex align="center">
                    <SubMessage
                        isInput={true}
                        roomId={activeRoom.id}
                        messageBriefInfo={{
                            id: storedInputInfo.input.messageForAction.message
                                .id,
                            date: DATE_FORMATTER_SHORT.format(
                                new Date(
                                    storedInputInfo.input.messageForAction.message.createdAt,
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
                    sendVoiceMessage={sendVoiceMessage}
                />
            ) : (
                <InputDuringMessage
                    ref={inputRef}
                    message={messageText}
                    sendMessage={() => sendMessage(messageText, fileList)}
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
    );
};

export default InputMessage;
