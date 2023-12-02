import { User } from "@prisma/client";
import { TValueOf } from "../models/TUtils";

export interface ISessionData {
    cookie: {
        originalMaxAge: number;
        expires: string;
        httpOnly: boolean;
        path: string;
    };
    passport: {
        user: {
            id: TValueOf<Pick<User, "id">>;
        };
    };
}
