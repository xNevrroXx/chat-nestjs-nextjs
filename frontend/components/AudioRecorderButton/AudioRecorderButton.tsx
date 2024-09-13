import React, { FC, Fragment, useMemo } from "react";
import { AudioOutlined } from "@ant-design/icons";
import { TUseAudioRecorderReturnType } from "@/hooks/useAudioRecorder.hook";
import { TValueOf } from "@/models/TUtils";
import { Button } from "antd";

interface IAudioRecorderProps {
    isRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "isRecording">>;
    startRecording: TValueOf<
        Pick<TUseAudioRecorderReturnType, "startRecording">
    >;
    stopRecording: TValueOf<Pick<TUseAudioRecorderReturnType, "stopRecording">>;
}

const AudioRecorderButton: FC<IAudioRecorderProps> = ({
    isRecording,
    startRecording,
    stopRecording,
}) => {
    if (!isRecording) {
        return (
            <Button
                type="text"
                icon={<AudioOutlined className="custom" />}
                onClick={startRecording}
                size="large"
            />
        );
    }

    return (
        <Button
            type="text"
            icon={<AudioOutlined className="custom" />}
            onClick={stopRecording}
            size="large"
        />
    );
};

export default AudioRecorderButton;
