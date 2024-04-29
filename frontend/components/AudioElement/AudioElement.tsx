import React, { FC, Fragment, JSX, useEffect, useRef, useState } from "react";
import classNames from "classnames";
// @ts-ignore
import { AudioVisualizer } from "react-audio-visualize";
import { Button, Flex, theme, Typography } from "antd";
import { PauseCircleOutlined } from "@ant-design/icons";
// own modules
import PlayCircleOutlined from "@/icons/PlayCircleOutlined";
// styles
import "./audio-element.scss";
import { IFile } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";

const { useToken } = theme;
const { Text } = Typography;

interface IVoiceRecording {
    blob?: Blob;
    url: string;
    originalName?: string;
    size?: TValueOf<Pick<IFile, "size">>;
    // default: 600px
    width?: number;
    // default: 50px
    height?: number;
    createdAt?: string;
    children?: JSX.Element;
}

const AudioElement: FC<IVoiceRecording> = ({
    blob: inputBlob,
    url,
    size,
    height = 30,
    width = 950,
    children,
    originalName,
}) => {
    const { token } = useToken();
    const [blob, setBlob] = useState<Blob | undefined>(inputBlob);
    const [blobUrl, setBlobUrl] = useState<string | null>(
        inputBlob ? URL.createObjectURL(inputBlob) : "",
    );
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioTimestamp, setAudioTimestamp] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        if (inputBlob) {
            // if the voice record is the local record
            return;
        }

        async function getBlobInfo() {
            const blob = await fetch(
                process.env.NEXT_PUBLIC_BASE_URL +
                    "/s3/file/" +
                    originalName +
                    "?path=" +
                    url,
            ).then((r) => r.blob());
            setBlob(blob);
            setBlobUrl(URL.createObjectURL(blob));
        }

        void getBlobInfo();
    }, [inputBlob, url]);

    const playAudio = () => {
        if (!audioRef.current) {
            return;
        }

        void audioRef.current.play();
        setIsPlaying(true);
    };

    const pauseAudio = () => {
        if (!audioRef.current) {
            return;
        }

        void audioRef.current.pause();
        setIsPlaying(false);
    };

    const onTimeUpdate: React.ReactEventHandler<HTMLAudioElement> = (event) => {
        if (!(event.target instanceof HTMLAudioElement)) {
            return;
        }

        setAudioTimestamp(event.target.currentTime);
    };

    return (
        <Fragment>
            <div className="audio-element__control-btn">
                {isPlaying ? (
                    <Button
                        type={"text"}
                        onClick={pauseAudio}
                        icon={<PauseCircleOutlined className="custom" />}
                        size="large"
                    />
                ) : (
                    <Button
                        type={"text"}
                        onClick={playAudio}
                        icon={<PlayCircleOutlined />}
                        size="large"
                    />
                )}
            </div>

            {blob && blobUrl && (
                <div className="audio-element__waves">
                    <AudioVisualizer
                        blob={blob}
                        width={width}
                        height={height}
                        barWidth={3}
                        gap={2}
                        barColor={"rgb(99,162,255)"}
                        barPlayedColor={"rgb(22, 119, 255)"}
                        currentTime={audioTimestamp}
                    />
                    <audio
                        ref={audioRef}
                        src={blobUrl || undefined}
                        onTimeUpdate={onTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                    />
                    {size && (
                        <div>
                            <Text style={{ color: token.colorTextSecondary }}>
                                {size.value} {size.unit}
                            </Text>
                            {children}
                        </div>
                    )}
                </div>
            )}
        </Fragment>
    );
};

const AudioElementWithWrapper: FC<IVoiceRecording> = (props) => {
    return (
        <Flex gap={"middle"} className={classNames("audio-element")}>
            <AudioElement {...props} />
        </Flex>
    );
};

export default AudioElement;
export { AudioElementWithWrapper, AudioElement };
