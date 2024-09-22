import {
    IRecentRoom,
    IRecentRoomInputStandard,
    IRecentRoomInputWithMessageForAction,
} from "@/models/recent-rooms/IRecentRooms.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom } from "@/models/room/IRoom.store";
import { MessageAction } from "@/models/room/IRoom.general";

export interface IResponseGetAllRecentRoomInfo {
    recentInputInfo: {
        roomId: TValueOf<Pick<IRecentRoom, "roomId">>;
        input: TValueOf<Pick<IRecentRoom, "input">>;
    }[];
}

export type TSendRecentMessageInfo = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    messageForAction?: {
        action: MessageAction;
        id: string;
    } | null;
    text?: string | null;
};
export type THandleRecentMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
} & IRecentRoomInputWithMessageForAction &
    Pick<IRecentRoomInputStandard, "text" | "uploadedFiles">;

export type TDeleteProcessedFile = {
    fileId: string;
};
