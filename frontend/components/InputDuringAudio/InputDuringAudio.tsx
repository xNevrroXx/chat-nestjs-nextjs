import React, { FC } from "react";
import { Button, Flex } from "antd";
import { CloseCircleOutlined, SendOutlined } from "@ant-design/icons";
// @ts-ignore
import { LiveAudioVisualizer } from "react-audio-visualize";
// own modules
import { TValueOf } from "@/models/TUtils";
import { TUseAudioRecorderReturnType } from "@/hooks/useAudioRecorder.hook";
import StopCircleOutlined from "@/icons/StopCircleOutlined";
import { AudioElement } from "@/components/AudioElement/AudioElement";

interface IInputDuringAudioProps {
    mediaRecorder: MediaRecorder | null;
    audio: TValueOf<Pick<TUseAudioRecorderReturnType, "audio">>;
    audioURL: TValueOf<Pick<TUseAudioRecorderReturnType, "audioURL">>;
    isRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "isRecording">>;
    stopRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "stopRecording">>;
    cleanAudio: TValueOf<Pick<TUseAudioRecorderReturnType, "cleanAudio">>;
    sendVoiceMessage: (record: Blob) => void;
}

const InputDuringAudio: FC<IInputDuringAudioProps> = ({
    mediaRecorder,
    stopRecording,
    audio,
    audioURL,
    cleanAudio,
    isRecording,
    sendVoiceMessage: onSendVoiceMessage,
}) => {
    const sendVoiceMessage = () => {
        if (!audio) {
            return;
        }

        onSendVoiceMessage(audio);
        cleanAudio();
    };

    return (
        <Flex
            vertical={false}
            style={{ width: "100%" }}
            align="center"
            gap="middle"
        >
            <div className="input-message__btn-wrapper">
                <Button
                    type={"text"}
                    onClick={cleanAudio}
                    icon={<CloseCircleOutlined className="custom" />}
                    size="large"
                />
            </div>

            {isRecording && (
                <div className="input-message__btn-wrapper">
                    <Button
                        type={"text"}
                        onClick={stopRecording}
                        icon={<StopCircleOutlined />}
                        size="large"
                    />
                </div>
            )}
            {audio && audioURL ? (
                <AudioElement blob={audio} url={audioURL} />
            ) : (
                <div className="input-message__field">
                    <LiveAudioVisualizer
                        width={"900px"}
                        height={"30px"}
                        mediaRecorder={mediaRecorder}
                    />
                </div>
            )}

            <div className="input-message__btn-wrapper">
                <Button
                    type="text"
                    icon={<SendOutlined className="custom" />}
                    onClick={sendVoiceMessage}
                    size="large"
                />
            </div>
        </Flex>
    );
};

export default InputDuringAudio;
