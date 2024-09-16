import {
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { Sex } from "@prisma/client";
import type { TUserLogin, TUserDto, TUser } from "./user.model";

export class UserDto implements TUserDto {
    id: string;
    email: string;
    displayName: string;
    givenName: string;
    familyName: string;
    age: number;
    sex: "MALE" | "FEMALE";
    color: string;
    createdAt: Date;
    updatedAt: Date | null;
    isDeleted: boolean;

    constructor(data: TUserDto) {
        this.id = data.id;
        this.email = data.email;
        this.displayName = data.displayName;
        this.givenName = data.givenName;
        this.familyName = data.familyName;
        this.age = data.age;
        this.sex = data.sex;
        this.color = data.color;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.isDeleted = data.isDeleted;
    }
}

export class UserRegister implements Partial<TUser> {
    @IsOptional()
    @IsString()
    displayName: string;
    @IsString()
    givenName: string;
    @IsString()
    familyName: string;
    @IsEmail()
    email: string;
    @IsNumber()
    age: number;
    @IsEnum(Sex)
    sex: "MALE" | "FEMALE";
    @IsString()
    password: string;

    constructor(
        displayName: string,
        givenName: string,
        familyName: string,
        email: string,
        age?: number | null,
        sex?: "MALE" | "FEMALE" | null,
        password?: string | null
    ) {
        this.displayName = displayName;
        this.givenName = givenName;
        this.familyName = familyName;
        this.email = email;
        this.age = age;
        this.sex = sex;
        this.password = password;
    }
}

export class UserRegisterOAuth implements Partial<TUser> {
    @IsString()
    displayName: string;
    @IsString()
    givenName: string;
    @IsString()
    familyName: string;
    @IsEmail()
    email: string;

    constructor(
        displayName: string,
        givenName: string,
        familyName: string,
        email: string
    ) {
        this.displayName = displayName;
        this.givenName = givenName;
        this.familyName = familyName;
        this.email = email;
    }
}

export class UserLogin implements TUserLogin {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}
