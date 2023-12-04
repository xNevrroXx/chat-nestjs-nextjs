import {AxiosResponse} from "axios";
// own modules
import $api from "../http";
import type {TRoomsResponse} from "@/models/IResponse/IRoomResponse";
import { IRoom, TCreateRoom, TTemporarilyRoomOrUserBySearch } from "@/models/IStore/IRoom";

class RoomService {
    protected static base = "/room";

    static async create(data: TTemporarilyRoomOrUserBySearch | TCreateRoom): Promise<AxiosResponse<IRoom>> {
        return $api.post<IRoom>(this.base + "/create", data);
    }

    static async getAll(): Promise<AxiosResponse<TRoomsResponse>> {
        return $api.get<TRoomsResponse>(this.base + "/all");
    }
}

export {RoomService};
