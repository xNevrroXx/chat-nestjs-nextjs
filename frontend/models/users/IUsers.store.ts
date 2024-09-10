import { IUserDto, TDepersonalizedUser } from "@/models/auth/IAuth.store";

export interface IUsers {
    users: (IUserDto | TDepersonalizedUser)[];
}

export interface IDepersonalizeOrDeleteAccount {
    whetherDepersonalize: "depersonalize" | "delete";
}
