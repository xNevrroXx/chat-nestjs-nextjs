import { AxiosResponse } from "axios";
// own modules
import $api from "../http";
// types
import type { IUsersResponse } from "@/models/users/IUser.response";
import { IDepersonalizeOrDeleteAccount } from "@/models/users/IUsers.store";

class UserService {
    protected static base = "/user";

    static async getAll(): Promise<AxiosResponse<IUsersResponse>> {
        return $api.get<IUsersResponse>(this.base + "/all");
    }

    static async deleteAccount(
        whetherDepersonalizeAccount: IDepersonalizeOrDeleteAccount,
    ): Promise<AxiosResponse<null>> {
        return $api.delete<null>(this.base, {
            data: whetherDepersonalizeAccount,
        });
    }
}

export { UserService };
