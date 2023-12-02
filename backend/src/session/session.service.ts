import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class SessionService {
    constructor(private readonly prisma: DatabaseService) {}

    async findOne(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput) {
        return this.prisma.session.findUnique({
            where: sessionWhereUniqueInput,
        });
    }
}
