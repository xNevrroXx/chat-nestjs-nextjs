import * as fs from "fs";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { AppConstantsService } from "../app.constants.service";
import { type File, Prisma } from "@prisma/client";
import * as path from "path";
import { TFileToClient } from "./IFile";
import { excludeSensitiveFields } from "../utils/excludeSensitiveFields";
import { byteSize } from "../utils/byteSize";

@Injectable()
export class FileService {
    constructor(
        private prisma: DatabaseService,
        private constants: AppConstantsService
    ) {
        if (!fs.existsSync(this.constants.USERS_DATA_FOLDER_PATH)) {
            fs.mkdirSync(this.constants.USERS_DATA_FOLDER_PATH);
        }
    }

    async write(arrayBuffer: ArrayBuffer, filename: string): Promise<void> {
        const buffer = Buffer.from(arrayBuffer);
        const pathToFile = path.join(
            this.constants.USERS_DATA_FOLDER_PATH,
            filename
        );
        fs.writeFile(pathToFile, buffer, (error) => {
            if (error) {
                throw new InternalServerErrorException();
            }
        });
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

    async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
        // todo delete from the disk
        return this.prisma.file.delete({
            where,
        });
    }

    normalizeFiles(files: File[]): TFileToClient[] {
        return files.map<TFileToClient>((file) => {
            // const filePath = path.join(
            //     this.constants.USERS_DATA_FOLDER_PATH,
            //     file.fileName
            // );
            const f = excludeSensitiveFields(file, [
                "path",
                "size",
            ]) as TFileToClient;

            f.url = file.path;
            f.size = byteSize({
                sizeInBytes: Number(file.size) /*fs.statSync(filePath).size*/,
            });
            return f;
        });
    }
}
