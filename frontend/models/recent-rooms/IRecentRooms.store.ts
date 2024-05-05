import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";
import { TMessageForActionEditOrReply } from "@/models/room/IRoom.general";
import { UploadFile } from "antd";

export interface IRecentRoom {
    id: TValueOf<Pick<IRoom, "id">>;
    isPreview: boolean;
    input: {
        messageForAction: TMessageForActionEditOrReply | null;
    } & (
        | {
              isAudioRecord: true;
              blob: Blob;
              url: string;
          }
        | {
              isAudioRecord: false;
              text: string;
              files: UploadFile[];
          }
    );
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
