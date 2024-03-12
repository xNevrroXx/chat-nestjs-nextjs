import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { GoogleOAuthGuard } from "./strategies/google.auth.guard";
import { AuthGuard } from "./auth.guard";
import { YandexOAuthGuard } from "./strategies/yandex.auth.guard";
import { UserDto, UserRegister } from "../user/userDto";
import { LocalAuthGuard } from "./strategies/local.auth.guard";
import { Response } from "express";
import { generateRandomBrightColor } from "../utils/generateRandomBrightColor";

@Controller("auth")
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Get("google")
    @UseGuards(GoogleOAuthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async googleAuth() {}

    @Get("redirect-google")
    @UseGuards(GoogleOAuthGuard)
    async redirectGoogle(@Res() response: Response) {
        const clientRedirectUrl = process.env.CLIENT_URL + "/main";
        const script = `
            <script>
                window.opener.location.replace("${clientRedirectUrl}");
                window.close();
            </script>
        `;
        response.send(script);
    }

    @Get("yandex")
    @UseGuards(YandexOAuthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async yandexAuth() {}

    @Get("redirect-yandex")
    @UseGuards(YandexOAuthGuard)
    async redirectYandex(@Res() response: Response) {
        const clientRedirectUrl = process.env.CLIENT_URL + "/main";
        const script = `
            <script>
                window.opener.location.replace("${clientRedirectUrl}");
                window.close();
            </script>
        `;
        response.send(script);
    }

    @HttpCode(HttpStatus.OK)
    @Post("sign-up")
    async register(@Body() user: UserRegister) {
        const hashedPassword = await bcrypt.hash(user.password, 3);
        await this.userService.create({
            ...user,
            color: generateRandomBrightColor(),
            displayName: user.displayName
                ? user.displayName
                : user.givenName + " " + user.familyName,
            password: hashedPassword,
        });
    }

    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Req() request) {
        const { id } = request.user;

        const targetUser = await this.userService.findOne({ id });
        const userDto = new UserDto(targetUser);

        return {
            user: userDto,
        };
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Get("logout")
    async logout(@Req() request) {
        request.session.destroy();
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get("check-authentication")
    async refresh(@Req() request) {
        const { id } = request.user;

        const targetUser = await this.userService.findOne({ id });
        const userDto = new UserDto(targetUser);

        return {
            user: userDto,
        };
    }
}
