import {FC, useEffect, useRef, useState} from "react";
import {Button, Flex} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import useFileUpload from "react-use-file-upload";
// own modules
import InputDuringMessage from "@/components/InputDuringMessage/InputDuringMessage";
import InputDuringAudio from "@/components/InputDuringAudio/InputDuringAudio";
import {useAudioRecorder} from "@/hooks/useAudioRecorder.hook";
import MessageReply from "@/components/MessageReply/MessageReply";
import {isSpecialKey} from "@/utils/checkIsNotSpecialKey";
import {
    FileType,
    IAttachment,
    TSendMessage,
    IEditMessage, IMessage, IForwardedMessage
} from "@/models/IStore/IRoom";
import {TValueOf} from "@/models/TUtils";
// styles
import "./input-message.scss";

interface IInputMessage {
    onSendMessage: (text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => void;
    onSendVoiceMessage: (record: Blob) => void;
    onSendEditedMessage: (text: TValueOf<Pick<IEditMessage, "text">>) => void;
    onTyping: () => void;
    messageForReply: IMessage | IForwardedMessage | null;
    messageForEdit: IMessage | null;
    removeMessageForAction: () => void;
}

const InputMessage: FC<IInputMessage> = ({
                                             onTyping,
                                             messageForEdit,
                                             messageForReply,
                                             onSendMessage,
                                             onSendVoiceMessage,
                                             onSendEditedMessage,
                                             removeMessageForAction
                                         }) => {
    const inputRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState<string>("");
    const {
        files,
        clearAllFiles,
        setFiles,
        removeFile
    } = useFileUpload();
    const {
        mediaRecorder,
        isRecording,
        audio,
        audioURL,
        startRecording,
        stopRecording,
        cleanAudio
    } = useAudioRecorder();

    useEffect(() => {
        if (!inputRef.current) return;

        inputRef.current?.focus();
    }, [messageForEdit, messageForReply]);

    useEffect(() => {
        if (!inputRef.current || !messageForEdit) return;

        setMessage(messageForEdit.text || "");
    }, [messageForEdit]);

    const onChangeMessage = (str: string) => {
        setMessage(str);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (
            event.key !== "Enter"
            || !(event.target instanceof HTMLDivElement)
            || !message
            || message.length === 0
        ) {
            if ( !isSpecialKey(event) ) {
                onTyping();
            }
            return;
        }

        void sendMessage();
        setMessage("");
    };

    const sendMessage = async () => {
        if (messageForEdit) {
            onSendEditedMessage(message);
            setMessage("");
            return;
        }

        const trimmedMessage = message ? message.trim() : null;
        const attachments = await files.reduce<Promise<IAttachment[]>>(async (previousValue, currentValue) => {
            const prev = await previousValue;
            const extensionInfo = currentValue.name.match(/(?<=\.)\D+$/) || [];
            const extension = extensionInfo.length === 1 ? extensionInfo[0] : "";

            prev.push({
                originalName: currentValue.name,
                fileType: FileType.ATTACHMENT,
                mimeType: currentValue.type,
                extension: extension,
                buffer: await currentValue.arrayBuffer()
            });
            return prev;
        }, Promise.all([]));

        onSendMessage(trimmedMessage, attachments);
        setMessage("");
        clearAllFiles();
    };

    return (
        <>
            <Flex className="input-message" justify="space-between" vertical align="self-start" gap="small">
                { (messageForEdit || messageForReply) &&
                    <Flex align="center">
                        <MessageReply
                            isInput={true}
                            message={messageForEdit! || messageForReply!}
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined/>}
                            onClick={removeMessageForAction}
                        />
                    </Flex>
                }
                {mediaRecorder.current && (isRecording || audioURL) ?
                    <InputDuringAudio
                        audio={audio}
                        mediaRecorder={mediaRecorder.current}
                        stopRecording={stopRecording}
                        cleanAudio={cleanAudio}
                        isRecording={isRecording}
                        audioURL={audioURL}
                        sendVoiceMessage={onSendVoiceMessage}
                    />
                    :
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
                }
            </Flex>
        </>
    );
};

export default InputMessage;