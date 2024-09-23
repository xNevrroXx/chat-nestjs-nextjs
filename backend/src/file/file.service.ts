import { Injectable } from "@nestjs/common";
import { type File, Prisma, PrismaPromise } from "@prisma/client";
import { TFileToClient } from "./file.model";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { byteSize } from "../utils/byteSize";
import { DatabaseService } from "../database/database.service";
import { AppConstantsService } from "../app.constants.service";

@Injectable()
export class FileService {
    constructor(
        private readonly appConstantsService: AppConstantsService,
        private readonly prisma: DatabaseService
    ) {}

    normalize(file: File): TFileToClient {
        const f = excludeSensitiveFields(file, [
            "path",
            "size",
        ]) as TFileToClient;

        f.url =
            this.appConstantsService.BACKEND_URL +
            "/api/s3/file/" +
            file.originalName +
            "?path=" +
            file.path;
        f.size = byteSize({
            sizeInBytes: file.size,
        });
        return f;
    }

    async findOne(
        fileWhereUniqueInput: Prisma.FileWhereUniqueInput
    ): Promise<File | null> {
        return this.prisma.file.findUnique({
            where: fileWhereUniqueInput,
        });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.FileWhereUniqueInput;
        where?: Prisma.FileWhereInput;
        orderBy?: Prisma.FileOrderByWithRelationInput;
    }): Promise<File[]> {
        const { skip, take, cursor, where, orderBy } = params;

        return this.prisma.file.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async delete(params: {
        where: Prisma.FileWhereUniqueInput;
    }): Promise<File> {
        return this.prisma.file.delete({
            ...params,
        });
    }
    async deleteMany(params: {
        where: Prisma.FileWhereInput;
    }): Promise<PrismaPromise<Prisma.BatchPayload>> {
        return this.prisma.file.deleteMany({
            ...params,
        });
    }
}
