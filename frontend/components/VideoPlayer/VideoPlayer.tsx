import { IFile } from "@/models/room/IRoom.store";

const VideoPlayer = (fileInfo: IFile) => {
    return (
        <video
            className="video-player"
            tabIndex={-1}
            controls={true}
            muted={true}
            loop={true}
            autoPlay={false}
            src={fileInfo.url}
        />
    );
};

export default VideoPlayer;
