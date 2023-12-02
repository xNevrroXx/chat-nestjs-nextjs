import {IUserDto} from "../IStore/IAuthentication.ts";

export interface IAuthResponse {
    accessToken: string,
    user: IUserDto
}