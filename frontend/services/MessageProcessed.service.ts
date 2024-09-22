import $api from "@/http";
import { AxiosResponse } from "axios";
import {
    IResponseGetAllRecentRoomInfo,
    TDeleteProcessedFile,
    TSendRecentMessageInfo,
} from "@/models/recent-rooms/recent-rooms.response";

class MessageProcessedService {
    protected static baseMessage = "/message-processed";
    protected static baseFile = "/file-processed";

    static async update(data: TSendRecentMessageInfo): Promise<AxiosResponse> {
        return $api.put(this.baseMessage, data);
    }

    static async deleteWaitedFile(
        data: TDeleteProcessedFile,
    ): Promise<AxiosResponse> {
        return $api.delete(this.baseFile, { data });
    }

    static async getAll(): Promise<
        AxiosResponse<IResponseGetAllRecentRoomInfo>
    > {
        return $api.get(this.baseMessage + "/all");
    }
}

export { MessageProcessedService };
