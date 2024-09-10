import { TPartialBy, TValueOf } from "@/models/TUtils";

export interface IUser {
    displayName: string;
    givenName: string;
    familyName: string;
    email: string;
    age: number;
    sex: Sex;
}

export enum Sex {
    MALE = "MALE",
    FEMALE = "FEMALE",
}

export interface IUserAuth extends TPartialBy<IUser, "displayName"> {
    password: string;
}

export interface IUserDto extends IUser {
    id: string;
    color: string;
    isDeleted: false;
    createdAt: string;
    updatedAt: string | undefined;
    userOnline: TUserOnline;
}

export type TDepersonalizedUser = {
    isDeleted: true;
} & Pick<IUserDto, "id" | "displayName" | "color" | "createdAt" | "updatedAt">;

export type TUserOnline = {
    id: string;
    userId: TValueOf<Pick<IUserDto, "id">>;
    isOnline: boolean;
    updatedAt: string | undefined;
};

export interface IAuth {
    user: IUserDto | null;
    isAuthenticated: boolean;
}

export type TLoginFormData = Pick<IUserAuth, "email" | "password">;
export type TRegisterFormData = Omit<IUserAuth, "displayName"> & {
    displayName?: TValueOf<Pick<IUserAuth, "displayName">>;
    passwordConfirmation: TValueOf<Pick<IUserAuth, "password">>;
};
