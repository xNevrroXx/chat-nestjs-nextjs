import React, { forwardRef, Fragment, useCallback, useRef } from "react";
import { PlusCircleOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Flex, UploadFile } from "antd";
import classNames from "classnames";
import InputEmoji from "react-input-emoji";
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
    updateFileList: (files: UploadFile[]) => void;
    fileList: UploadFile[];
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
            updateFileList,
            fileList,
            onChange,
        },
        ref,
    ) => {
        const buttonAddAttachmentRef = useRef<HTMLButtonElement | null>(null);

        const onClickButtonFiles = useCallback(() => {
            if (!buttonAddAttachmentRef.current) {
                return;
            }

            buttonAddAttachmentRef.current.click();
        }, [buttonAddAttachmentRef]);

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
                            type="text"
                            icon={<PlusCircleOutlined className="custom" />}
                            onClick={onClickButtonFiles}
                            size="large"
                        />
                    </div>
                    <InputEmoji
                        ref={ref}
                        value={message}
                        theme="dark"
                        placeholder={"Введите сообщение..."}
                        disableRecent={true}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        cleanOnEnter={false}
                        shouldReturn={true}
                        keepOpened={true}
                        tabIndex={0}
                        inputClass={classNames("input-message__textbox")}
                        borderRadius={5}
                        fontFamily={"Roboto, sans-serif"}
                        shouldConvertEmojiToImage={false}
                    />
                    <div className="input-message__btn-wrapper">
                        {message || fileList.length > 0 ? (
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
                <UploadFiles
                    ref={buttonAddAttachmentRef}
                    updateFileList={updateFileList}
                    fileList={fileList}
                />
            </Fragment>
        );
    },
);
InputDuringMessage.displayName = "InputDuringMessage";

export default InputDuringMessage;
