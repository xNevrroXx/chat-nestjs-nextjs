import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { IUserSessionPayload } from "../../user/user.model";

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: "email",
        });
    }

    async validate(
        email: string,
        password: string
    ): Promise<IUserSessionPayload> {
        const user = await this.authService.localValidateUser(email, password);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return user;
    }
}
