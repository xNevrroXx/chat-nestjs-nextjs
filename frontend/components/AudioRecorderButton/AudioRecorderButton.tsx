import React, {FC, Fragment, useMemo} from "react";
import {AudioTwoTone} from "@ant-design/icons";
import {IUseAudioRecorderReturnType} from "@/hooks/useAudioRecorder.hook";
import {TValueOf} from "@/models/TUtils";
import {Button} from "antd";

interface IAudioRecorderProps {
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>;
    startRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "startRecording">>;
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>;
}

const AudioRecorderButton: FC<IAudioRecorderProps> = ({
                                                    isRecording,
                                                    startRecording,
                                                    stopRecording
                                                }) => {
    const content = useMemo(() => {
        if (!isRecording) {
            return (
                <Button
                    type="text"
                    icon={<AudioTwoTone className="custom"/>}
                    onClick={startRecording}
                    size="large"
                />
            );
        }

        return (
            <Button
                type="text"
                icon={<AudioTwoTone className="custom"/>}
                onClick={stopRecording}
                size="large"
            />
        );
    }, [isRecording, startRecording, stopRecording]);

    return (
        <Fragment>
            {content}
        </Fragment>
    );
};

export default AudioRecorderButton;
