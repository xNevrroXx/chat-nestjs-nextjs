import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { TDepersonalizeOrDelete } from "./IUser";
import { User } from "@prisma/client";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Delete()
    async deleteMyAccount(
        @Req() request,
        @Body("whetherDepersonalize")
        depersonalizeOrDelete: TDepersonalizeOrDelete
    ) {
        const user = request.user;

        if (depersonalizeOrDelete === "delete") {
            await this.userService.delete({ id: user.id });
            return;
        }

        const depersonalizedUserData: Omit<User, "id" | "createdAt"> = {
            isDeleted: true,
            displayName: "Deleted account",
            color: "grey",

            email: null,
            familyName: null,
            givenName: null,
            password: null,
            sex: null,
            age: null,

            updatedAt: new Date(),
        };

        await this.userService.update({
            where: {
                id: user.id,
            },
            data: {
                ...depersonalizedUserData,
                userOnline: {
                    delete: {},
                },
                userTyping: {
                    delete: {},
                },
                folders: {
                    deleteMany: {},
                },
                deletedMessages: {
                    deleteMany: {},
                },
                messageBeingProcessed: {
                    deleteMany: {},
                },
                participant: {
                    updateMany: {
                        where: {
                            userId: user.id,
                        },
                        data: {
                            isStillMember: false,
                        },
                    },
                },
            },
        });
        request.session.destroy();
    }

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
