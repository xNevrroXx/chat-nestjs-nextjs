import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";
import { useFileUploadHook } from "react-use-file-upload/dist/lib/types";
import { TMessageForActionEditOrReply } from "@/models/room/IRoom.general";

export interface IRecentRoom {
    id: TValueOf<Pick<IRoom, "id">>;
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
              files: TValueOf<Pick<useFileUploadHook, "files">>;
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
