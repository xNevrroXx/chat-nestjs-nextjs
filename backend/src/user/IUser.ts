import { TValueOf } from "../models/TUtils";
import { Prisma, User } from "@prisma/client";

export type TUser = Omit<User, "id" | "createdAt" | "updatedAt">;

export type TUserDto = { id: string } & Omit<TUser, "password">;

export interface IUserSessionPayload {
    id: TValueOf<Pick<TUserDto, "id">>;
}

export type TUserLogin = Pick<User, "email" | "password">;

export function isUserWithRefreshToken(
    data: User | Prisma.UserGetPayload<{ include: { refreshToken: true } }>
): data is Prisma.UserGetPayload<{ include: { refreshToken: true } }> {
    return (
        data &&
        !!(data as Prisma.UserGetPayload<{ include: { refreshToken: true } }>)
            .refreshToken
    );
}
