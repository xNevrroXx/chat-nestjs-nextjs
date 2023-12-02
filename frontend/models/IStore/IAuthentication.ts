import {TValueOf} from "@/models/TUtils";

export interface IUser {
    displayName: string,
    givenName: string,
    familyName: string,
    email: string,
    age: number,
    sex: Sex
}

export enum Sex {
    MALE = "MALE",
    FEMALE = "FEMALE"
}

export interface IUserAuth extends IUser {
    password: string;
}

export interface IUserDto extends IUser {
    id: string,
    createdAt: string,
    updatedAt: string | undefined,
    userOnline: TUserOnline
}

export type TUserOnline = {
    id: string
    userId: TValueOf<Pick<IUserDto, "id">>
    isOnline: boolean
    updatedAt: string | undefined
}

export interface IAuthentication {
    user: IUserDto | null,
    isAuthenticated: boolean
}

export type TLoginFormData = Omit<IUserAuth, "name" | "surname" | "sex" | "age">;
export type TRegisterFormData = IUserAuth & { passwordConfirmation: TValueOf<Pick<IUserAuth, "password">> };
