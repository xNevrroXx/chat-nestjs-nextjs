import {AxiosResponse} from "axios";
// own modules
import $api from "../http";
// types
import type {TUsersResponse} from "../models/IResponse/IUsersResponse.ts";

class UsersService {
    protected static base = "/user";

    static async getAll(): Promise<AxiosResponse<TUsersResponse>> {
        return $api.get<TUsersResponse>(this.base + "/all");
    }
}

export {UsersService};