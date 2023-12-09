import {AxiosResponse} from "axios";
// own modules
import $api from "../http";
import type {TRoomsResponse} from "@/models/room/IRoom.response";
import { IRoom, TCreateGroupRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";

class RoomService {
    protected static base = "/room";

    static async join(data: TPreviewExistingRoom): Promise<AxiosResponse<IRoom>> {
        return $api.post<IRoom>(this.base + "/join", data);
    }

    static async create(data: TCreateGroupRoom): Promise<AxiosResponse<IRoom>> {
        return $api.post<IRoom>(this.base + "/create", data);
    }

    static async getAll(): Promise<AxiosResponse<TRoomsResponse>> {
        return $api.get<TRoomsResponse>(this.base + "/all");
    }
}

export {RoomService};
