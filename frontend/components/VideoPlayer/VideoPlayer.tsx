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
            src={
                process.env.NEXT_PUBLIC_BASE_URL +
                "/s3/file/" +
                fileInfo.originalName +
                "?path=" +
                fileInfo.url
            }
        />
    );
};

export default VideoPlayer;
