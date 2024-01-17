import { FileType } from "@/models/room/IRoom.store";
import { exhaustiveCheck } from "@/models/TUtils";

function generateFileName(
    senderId: string,
    typeMessage: FileType,
    extension: string,
    index: number,
) {
    let type: null | string = null;
    switch (typeMessage) {
        case FileType.ATTACHMENT:
            type = "ATTACHMENT";
            break;
        case FileType.VIDEO_RECORD:
            type = "VIDEO-RECORD";
            break;
        case FileType.VOICE_RECORD:
            type = "VOICE-RECORD";
            break;
        default:
            exhaustiveCheck(typeMessage);
    }

    return (
        senderId + "-" + type + "-" + Date.now() + "-" + index + "." + extension
    );
}

export { generateFileName };
