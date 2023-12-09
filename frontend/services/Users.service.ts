import {AxiosResponse} from "axios";
// own modules
import $api from "../http";
// types
import type {IUsersResponse} from "../models/users/IUser.response.ts";

class UsersService {
    protected static base = "/user";

    static async getAll(): Promise<AxiosResponse<IUsersResponse>> {
        return $api.get<IUsersResponse>(this.base + "/all");
    }
}

export {UsersService};
