import { BadRequestException, Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

@Controller("file")
export class FileController {
    @Get("by-chunks")
    async getAttachmentByChunks(
        @Req() request: Request,
        @Res() response: Response
    ) {
        const { name } = request.query;
        const mimeType = mime.lookup(name as string);
        // todo add ability to stream files from S3
        const filePath = path.join("plug-path", name as string);
        const fileInfo = fs.statSync(filePath);
        const fileSize = fileInfo.size;
        if (
            !fileInfo.isFile() ||
            !mimeType ||
            !(mimeType.includes("video") || mimeType.includes("audio"))
        ) {
            throw new BadRequestException();
        }

        const range = request.headers.range || "0";
        const chunkSize = 1e6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, fileSize - 1);

        const contentLength = end - start + 1;

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": mimeType,
        };

        response.writeHead(206, headers);

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(response);
    }
}
