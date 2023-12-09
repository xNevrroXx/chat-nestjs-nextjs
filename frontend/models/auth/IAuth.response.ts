import {IUserDto} from "@/models/auth/IAuth.store";

export interface IAuthResponse {
    accessToken: string,
    user: IUserDto
}
