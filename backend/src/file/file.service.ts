import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { type File, Prisma, PrismaPromise } from "@prisma/client";
import { TFileToClient } from "./file.model";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { byteSize } from "../utils/byteSize";

@Injectable()
export class FileService {
    constructor(private prisma: DatabaseService) {}

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

    normalizeFiles(files: File[]): TFileToClient[] {
        return files.map<TFileToClient>((file) => {
            const f = excludeSensitiveFields(file, [
                "path",
                "size",
            ]) as TFileToClient;

            f.url = file.path;
            f.size = byteSize({
                sizeInBytes: file.size,
            });
            return f;
        });
    }
}
