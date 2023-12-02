import {useRef, useState} from "react";

export type IUseAudioRecorderReturnType = ReturnType<typeof useAudioRecorder>;

const mimeType = "audio/webm" as const;

const useAudioRecorder = () => {
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audio, setAudio] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const getMicrophonePermission = async () => {
        let streamData: MediaStream | null = null;
        if ("MediaRecorder" in window) {
            try {
                streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setStream(streamData);
            } catch (err) {
                if (err instanceof Error) {
                    alert(err.message);
                }
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }

        return streamData;
    };

    const startRecording = async () => {
        const stream = await getMicrophonePermission();
        if (!stream) {
            return;
        }

        setIsRecording(true);
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, {mimeType});
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        const localAudioChunks: Blob[] = [];

        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        if (!mediaRecorder.current) {
            return;
        }
        setIsRecording(false);
        //stops the recording instance
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob); // The "AudioVisualizer" doesn't need the
            setAudio(audioBlob);
            setAudioURL(audioUrl);
            setAudioChunks([]);
        };
        mediaRecorder.current.stop();
    };

    const cleanAudio = () => {
        mediaRecorder.current = null;
        setIsRecording(false);
        setAudio(null);
        setAudioURL(null);
        setStream(null);
    };

    return {
        stream,
        mediaRecorder,
        isRecording,
        audio,
        audioURL,
        startRecording,
        stopRecording,
        cleanAudio
    };
};

export {useAudioRecorder};