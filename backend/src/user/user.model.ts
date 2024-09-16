import { TValueOf } from "../models/TUtils";
import { User } from "@prisma/client";

export type TUser = Omit<User, "id" | "createdAt" | "updatedAt" | "color">;

export type TUserDto = Omit<User, "password">;

export interface IUserSessionPayload {
    id: TValueOf<Pick<TUserDto, "id">>;
}

export type TUserLogin = Pick<User, "email" | "password">;

export type TDepersonalizeOrDelete = "depersonalize" | "delete";
