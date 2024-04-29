import axios, { type AxiosResponse } from "axios";
// own modules
import $api, { API_URL } from "@/http";
// types
import type { IAuthResponse } from "@/models/auth/IAuth.response";
import type { IUserAuth } from "@/models/auth/IAuth.store";

class AuthService {
    protected static base = "/auth";
    static async login(
        email: string,
        password: string,
    ): Promise<AxiosResponse<IAuthResponse>> {
        return $api.post<IAuthResponse>(this.base + "/login", {
            email,
            password,
        });
    }

    static async registration(
        user: IUserAuth,
    ): Promise<AxiosResponse<IAuthResponse>> {
        return $api.post<IAuthResponse>(this.base + "/sign-up", user);
    }

    static async logout(): Promise<AxiosResponse<null>> {
        return $api.get<null>(this.base + "/logout");
    }

    static async recoveryPasswordGetLink(
        email: string,
    ): Promise<AxiosResponse<null>> {
        return $api.post<null>(this.base + "/recovery/get-link", { email });
    }

    static async recoveryPasswordSetNew(
        code: string,
        password: string,
    ): Promise<void> {
        return $api.post(this.base + `/recovery/${code}`, { password });
    }

    static async checkAuth(): Promise<AxiosResponse<IAuthResponse>> {
        return axios.get<IAuthResponse>(
            `${API_URL}/auth/check-authentication`,
            { withCredentials: true },
        );
    }
}

export { AuthService };
