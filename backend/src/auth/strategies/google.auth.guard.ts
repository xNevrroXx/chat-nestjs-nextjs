import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
    constructor(private readonly configService: ConfigService) {
        super({
            accessType: "offline",
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const result = (await super.canActivate(context)) as boolean;

        await super.logIn(request);

        return result;
    }
}
