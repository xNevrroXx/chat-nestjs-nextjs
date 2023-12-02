import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport/dist/auth.guard";
import { Request } from "express";

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        client.user = await this.authService.verify(
            client.handshake.headers.sessionid
        );
        return true;
    }
}
