import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get("all")
    async getAll(@Req() request) {
        const users = await this.userService.findMany({
            where: {
                NOT: {
                    id: request.user.id,
                },
            },
            include: {
                userOnline: true,
            },
        });

        return {
            users: users.map((user) =>
                excludeSensitiveFields(user, ["password"])
            ),
        };
    }
}
