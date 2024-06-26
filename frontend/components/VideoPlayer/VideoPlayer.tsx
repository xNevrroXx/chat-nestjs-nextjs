import { IFile } from "@/models/room/IRoom.store";
import ReactPlayer from "react-player";
// styles
import "./video-player.scss";

const VideoPlayer = (fileInfo: IFile) => {
    return (
        <ReactPlayer
            className="video-player"
            tabIndex={-1}
            previewTabIndex={-1}
            controls={true}
            muted={true}
            loop={true}
            playing={false}
            url={
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
