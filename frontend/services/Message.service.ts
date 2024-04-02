import $api from "@/http";
import { AxiosResponse } from "axios";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
} from "@/models/room/IRoom.store";

class MessageService {
    protected static base = "/message";

    static async getById(
        id: string,
    ): Promise<AxiosResponse<IInnerStandardMessage | IInnerForwardedMessage>> {
        return $api.get(this.base + "/" + id);
    }
}

export { MessageService };
