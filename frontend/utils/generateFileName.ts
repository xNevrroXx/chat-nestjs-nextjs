import {FileType} from "@prisma/client";
import {exhaustiveCheck} from "../chat/IChat";

function generateFileName(senderId: string, typeMessage: FileType, extension: string, index: number) {
    let type: null | string = null;
    switch (typeMessage) {
        case "ATTACHMENT":
            type = "ATTACHMENT";
            break;
        case "VIDEO_RECORD":
            type = "VIDEO-RECORD";
            break;
        case "VOICE_RECORD":
            type = "VOICE-RECORD";
            break;
        default:
            exhaustiveCheck(typeMessage);
    }

    return senderId + "-" + type + "-" + Date.now() + "-" + index + "." + extension;
}

export {generateFileName};