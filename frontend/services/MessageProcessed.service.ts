import $api from "@/http";
import { AxiosResponse } from "axios";
import { TSendRecentMessageInfo } from "@/models/recent-rooms/IRecentRooms.store";
import { IWithSocketId } from "@/models/ISocket-io";

class MessageProcessedService {
    protected static base = "/message-processed";

    static async update(
        data: TSendRecentMessageInfo & IWithSocketId,
    ): Promise<AxiosResponse> {
        return $api.put(this.base, data);
    }
}

export { MessageProcessedService };
