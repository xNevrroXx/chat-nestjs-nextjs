import { Injectable } from "@nestjs/common";
import { Participant, Prisma } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { TNormalizedParticipant } from "./IParticipant";

@Injectable()
export class ParticipantService {
    constructor(private readonly prisma: DatabaseService) {}

    async findMany<T extends Prisma.ParticipantInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ParticipantWhereUniqueInput;
        where?: Prisma.ParticipantWhereInput;
        orderBy?: Prisma.ParticipantOrderByWithRelationInput;
        select?: Prisma.ParticipantSelect;
        include?: T;
    }): Promise<
        Prisma.ParticipantGetPayload<{ include: T }>[] | Participant[]
    > {
        const { skip, take, cursor, where, orderBy, include } = params;

        return this.prisma.participant.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include,
        });
    }
    async update<T extends Prisma.ParticipantInclude>(params: {
        where: Prisma.ParticipantWhereUniqueInput;
        data: Prisma.ParticipantUpdateInput;
        include?: T;
    }): Promise<
        Prisma.ParticipantGetPayload<{ include: T }> | Participant | null
    > {
        const { where, data, include } = params;

        return this.prisma.participant.update({
            where,
            data,
            include,
        });
    }

    async create<T extends Prisma.ParticipantInclude>(params: {
        data: Prisma.ParticipantCreateInput;
        include?: T;
    }): Promise<
        Prisma.ParticipantGetPayload<{ include: T }> | Participant | null
    > {
        const { data, include } = params;

        return this.prisma.participant.create({
            data,
            include,
        });
    }

    normalize(
        participant: Prisma.ParticipantGetPayload<{
            include: {
                user: {
                    include: {
                        userTyping: true;
                    };
                };
            };
        }>
    ): TNormalizedParticipant {
        const userNickname = participant.user.displayName;
        const isTyping = participant.user.userTyping
            ? participant.user.userTyping.isTyping
            : false;
        const participantInfo = {
            ...participant,
            isTyping: isTyping,
            nickname: userNickname,
            color: participant.user.color,
        };
        delete participantInfo.user;

        return participantInfo;
    }
}
