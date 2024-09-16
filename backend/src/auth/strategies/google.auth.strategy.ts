import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { UserService } from "../../user/user.service";
import { UserRegisterOAuth } from "../../user/user.dto";
import { Injectable } from "@nestjs/common";
import { AppConstantsService } from "../../app.constants.service";
import { generateRandomBrightColor } from "../../utils/generateRandomBrightColor";

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, "google") {
    constructor(
        private readonly userService: UserService,
        private readonly appConstantsService: AppConstantsService
    ) {
        super({
            clientID: appConstantsService.GOOGLE_CLIENT_ID,
            clientSecret: appConstantsService.GOOGLE_CLIENT_SECRET,
            callbackURL: `${appConstantsService.BACKEND_URL}/api/auth/redirect-google`,
            scope: ["email", "profile"],
        });
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ): Promise<any> {
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
