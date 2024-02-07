import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { IUserSessionPayload } from "../user/IUser";
import { UserService } from "../user/user.service";
import { SessionService } from "../session/session.service";
import { ISessionData } from "../session/ISession";
import { AppConstantsService } from "../app.constants.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
        private readonly appConstantsService: AppConstantsService
    ) {}

    async localValidateUser(email: string, password: string) {
        const user = await this.userService.findOne({ email });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        } else if (!user.password) {
            throw new BadRequestException(
                "Try logging in using one of the suggested social networks."
            );
        }

        const isPasswordEquals = await bcrypt.compare(password, user.password);
        if (!isPasswordEquals) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return {
            id: user.id,
            name: user.givenName,
        };
    }

    async verify(signedSession: string): Promise<IUserSessionPayload> {
        if (!signedSession) {
            throw new UnauthorizedException();
        }

        const sessionId = signedSession.slice(2).replace(/\..+/, "");
        const session = await this.sessionService.findOne({
            sid: sessionId,
        });
        if (!session) {
            throw new UnauthorizedException();
        }

        const sessionData: ISessionData = JSON.parse(session.data);
        const userId = sessionData.passport.user.id;

        return {
            id: userId,
        };
    }
}
