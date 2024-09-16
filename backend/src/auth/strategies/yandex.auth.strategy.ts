import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-yandex";
import { Injectable } from "@nestjs/common";
import { UserRegisterOAuth } from "../../user/user.dto";
import { UserService } from "../../user/user.service";
import { AppConstantsService } from "../../app.constants.service";
import { generateRandomBrightColor } from "../../utils/generateRandomBrightColor";

@Injectable()
export class YandexAuthStrategy extends PassportStrategy(Strategy, "yandex") {
    constructor(
        private readonly userService: UserService,
        private readonly appConstantsService: AppConstantsService
    ) {
        super({
            clientID: appConstantsService.YANDEX_CLIENT_ID,
            clientSecret: appConstantsService.YANDEX_CLIENT_SECRET,
            callbackURL: `${appConstantsService.BACKEND_URL}/api/auth/redirect-yandex`,
        });
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: string | null, user: any) => void
    ) {
        const { name, emails, photos, displayName } = profile;

        let user = await this.userService.findOne({
            email: emails[0].value,
        });
        if (!user) {
            const newUser = new UserRegisterOAuth(
                displayName,
                name.givenName,
                name.familyName,
                emails[0].value
            );
            user = await this.userService.create({
                ...newUser,
                color: generateRandomBrightColor(),
            });
        }
        done(null, user);
    }
}
