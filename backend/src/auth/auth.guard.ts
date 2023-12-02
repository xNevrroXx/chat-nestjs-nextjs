import { ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";

@Injectable()
export class AuthGuard extends PassportAuthGuard([
    "local",
    "google",
    "yandex",
]) {
    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        return request.isAuthenticated();
    }
}
