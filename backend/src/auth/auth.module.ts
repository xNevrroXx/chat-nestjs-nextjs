import { Global, Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { WsAuthGuard } from "./ws-auth.guard";
import { PassportModule } from "@nestjs/passport";
import { LocalAuthGuard } from "./strategies/local.auth.guard";
import { LocalAuthStrategy } from "./strategies/local.auth.strategy";
import { SessionSerializer } from "./session.serializer";
import { GoogleOAuthGuard } from "./strategies/google.auth.guard";
import { GoogleAuthStrategy } from "./strategies/google.auth.strategy";
import { YandexOAuthGuard } from "./strategies/yandex.auth.guard";
import { YandexAuthStrategy } from "./strategies/yandex.auth.strategy";
import { AuthController } from "./auth.controller";
import { UserModule } from "../user/user.module";
import { SessionModule } from "../session/session.module";

@Global()
@Module({
    imports: [PassportModule, UserModule, SessionModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthGuard,
        WsAuthGuard,
        LocalAuthGuard,
        LocalAuthStrategy,
        GoogleOAuthGuard,
        GoogleAuthStrategy,
        YandexOAuthGuard,
        YandexAuthStrategy,
        SessionSerializer,
    ],
    exports: [
        AuthGuard,
        WsAuthGuard,
        AuthService,
        LocalAuthGuard,
        GoogleOAuthGuard,
        YandexOAuthGuard,
    ],
})
export class AuthModule {}
