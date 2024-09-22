import { TValueOf } from "@/models/TUtils";
import { IFile, IRoom } from "@/models/room/IRoom.store";
import { TMessageForEditOrReply } from "@/models/room/IRoom.general";
import { UploadFile } from "antd";

export interface IRecentRoom {
    roomId: TValueOf<Pick<IRoom, "id">>;
    isPreview: boolean;
    input: IRecentRoomInputWithMessageForAction &
        (IRecentRoomInputWithVoiceRecord | IRecentRoomInputStandard);
}

export interface IRecentRoomInputWithMessageForAction {
    messageForAction: TMessageForEditOrReply | null | undefined;
}
export interface IRecentRoomInputWithVoiceRecord {
    isAudioRecord: true;
    blob: Blob;
    url: string;
}
export interface IRecentRoomInputStandard {
    isAudioRecord: false;
    text: string;
    files: UploadFile[];
    // uploaded files from another device.
    uploadedFiles: IFile[];
}

export interface IRecentRooms {
    rooms: {
        byId: {
            [id: TValueOf<Pick<IRoom, "id">>]: IRecentRoom;
        };
    };
    allIds: TValueOf<Pick<IRoom, "id">>[];
    currentRoomId: TValueOf<Pick<IRoom, "id">> | null;
}

export type TAddRecentRoomData = {
    id: TValueOf<Pick<IRoom, "id">>;
    isPreview?: true;
};

export type TUpdateMessageForAction = Pick<
    IRecentRoom["input"],
    "messageForAction"
>;
