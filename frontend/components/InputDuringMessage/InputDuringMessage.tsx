import React, { forwardRef, Fragment, useRef } from "react";
import {
    PlusCircleOutlined,
    SendOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import { Button, Flex } from "antd";
import classNames from "classnames";
import InputEmoji from "react-input-emoji";
import { useFileUploadHook } from "react-use-file-upload/dist/lib/types";
// own modules
import AudioRecorderButton from "@/components/AudioRecorderButton/AudioRecorderButton";
import UploadFiles from "@/components/UploadFiles/UploadFiles";
import { TUseAudioRecorderReturnType } from "@/hooks/useAudioRecorder.hook";
import { TValueOf } from "@/models/TUtils";

interface IInputDuringMessageProps {
    message: string;
    sendMessage: () => void;
    onChange: (str: string) => void;
    onKeyDown: (event: KeyboardEvent) => void;
    isRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "isRecording">>;
    startRecording: TValueOf<
        Pick<TUseAudioRecorderReturnType, "startRecording">
    >;
    stopRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "stopRecording">>;
    files: TValueOf<Pick<useFileUploadHook, "files">>;
    setFiles: TValueOf<Pick<useFileUploadHook, "setFiles">>;
    removeFile: TValueOf<Pick<useFileUploadHook, "removeFile">>;
}

const InputDuringMessage = forwardRef<HTMLDivElement, IInputDuringMessageProps>(
    (
        {
            message,
            sendMessage,
            onKeyDown,
            isRecording,
            startRecording,
            stopRecording,
            files,
            setFiles,
            removeFile,
            onChange,
        },
        ref,
    ) => {
        const emojiButtonRef = useRef<HTMLDivElement | null>(null);
        const inputFilesRef = useRef<HTMLInputElement | null>(null);
        const buttonAddFilesRef = useRef<HTMLButtonElement | null>(null);

        const onClickButtonFiles = () => {
            if (!inputFilesRef.current) {
                return;
            }
            inputFilesRef.current.click();
        };

        return (
            <Fragment>
                <Flex
                    vertical={false}
                    style={{ width: "100%" }}
                    align="self-end"
                    gap="middle"
                >
                    <div className="input-message__btn-wrapper">
                        <Button
                            ref={buttonAddFilesRef}
                            type="text"
                            icon={<PlusCircleOutlined className="custom" />}
                            onClick={onClickButtonFiles}
                            size="large"
                        />
                        <input
                            ref={inputFilesRef}
                            type="file"
                            multiple
                            style={{ display: "none" }}
                            onChange={(e) => {
                                setFiles(e as never as Event, "a");
                                if (
                                    !inputFilesRef.current ||
                                    inputFilesRef.current.type !== "file"
                                ) {
                                    return;
                                }
                                inputFilesRef.current.value = "";
                            }}
                        />
                    </div>
                    <div
                        className="input-message__field"
                        style={{ flexGrow: 1 }}
                    >
                        <InputEmoji
                            ref={ref}
                            value={message}
                            set="google"
                            theme="dark"
                            placeholder={"Введите сообщение..."}
                            buttonRef={emojiButtonRef}
                            disableRecent={true}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            cleanOnEnter={true}
                            shouldReturn={true}
                            keepOpened={true}
                            tabIndex={0}
                            inputClass={classNames("input-message__textbox")}
                            borderRadius={5}
                            fontFamily={"Roboto, sans-serif"}
                        />
                    </div>
                    <div className="input-message__btn-wrapper">
                        <Button
                            ref={emojiButtonRef}
                            type="text"
                            icon={<SmileOutlined className="custom" />}
                            size="large"
                        />
                    </div>
                    <div className="input-message__btn-wrapper">
                        {message || files.length > 0 ? (
                            <Button
                                type="text"
                                icon={<SendOutlined className="custom" />}
                                onClick={sendMessage}
                                size="large"
                            />
                        ) : (
                            <AudioRecorderButton
                                isRecording={isRecording}
                                startRecording={startRecording}
                                stopRecording={stopRecording}
                            />
                        )}
                    </div>
                </Flex>
                {files.length > 0 && (
                    <UploadFiles
                        buttonRef={buttonAddFilesRef}
                        attachments={files}
                        removeAttachment={removeFile}
                    />
                )}
            </Fragment>
        );
    },
);
InputDuringMessage.displayName = "InputDuringMessage";

export default InputDuringMessage;
