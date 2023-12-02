import React, {FC} from "react";
import {Button, Flex} from "antd";
import {CloseCircleOutlined, SendOutlined} from "@ant-design/icons";
// @ts-ignore
import {LiveAudioVisualizer} from "react-audio-visualize";
// own modules
import {TValueOf} from "../../models/TUtils.ts";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import StopCircleOutlined from "../../icons/StopCircleOutlined.tsx";
import AudioElement from "../AudioElement/AudioElement.tsx";

interface IInputDuringAudioProps {
    mediaRecorder: MediaRecorder;
    audio: TValueOf<Pick<IUseAudioRecorderReturnType, "audio">>;
    audioURL: TValueOf<Pick<IUseAudioRecorderReturnType, "audioURL">>;
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>;
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>;
    cleanAudio: TValueOf<Pick<IUseAudioRecorderReturnType, "cleanAudio">>;
    sendVoiceMessage: (record: Blob) => void;
}

const InputDuringAudio: FC<IInputDuringAudioProps> = ({
                                                          mediaRecorder,
                                                          stopRecording,
                                                          audio,
                                                          audioURL,
                                                          cleanAudio,
                                                          isRecording,
                                                          sendVoiceMessage: onSendVoiceMessage
                                                      }) => {
    const sendVoiceMessage = () => {
        if (!audio) {
            return;
        }

        onSendVoiceMessage(audio);
        cleanAudio();
    };

    return (
        <Flex vertical={false} style={{width: "100%"}} align="self-end" gap="middle">
            <div className="input-message__btn-wrapper">
                <Button
                    type={"text"}
                    onClick={cleanAudio} 
                    icon={<CloseCircleOutlined/>}
                    size="large"
                />
            </div>

            {isRecording &&
                <div className="input-message__btn-wrapper">
                    <Button
                        type={"text"}
                        onClick={stopRecording}
                        icon={<StopCircleOutlined/>}
                        size="large"
                    />
                </div>
            }

            <div className="input-message__field">
                {audio && audioURL ?
                    <AudioElement blob={audio} url={audioURL}/>
                    :
                    <LiveAudioVisualizer
                        width={"610px"}
                        height={"35px"}
                        mediaRecorder={mediaRecorder}
                    />
                }
            </div>

            <div className="input-message__btn-wrapper">
                <Button
                    type="text"
                    icon={<SendOutlined/>}
                    onClick={sendVoiceMessage}
                    size="large"
                />
            </div>
        </Flex>
    );
};

export default InputDuringAudio;