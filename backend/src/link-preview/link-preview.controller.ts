import { BadRequestException, Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";
import { LinkPreviewService } from "./link-preview.service";
import axios from "axios";

@Controller("link-preview")
export class LinkPreviewController {
    constructor(private readonly linkPreviewService: LinkPreviewService) {}

    @Get()
    async getLinkInfo(@Req() request: Request) {
        const { url } = request.query;
        if (!url) return;

        try {
            const { data } = await axios.get(url as string);
            const page = await this.linkPreviewService.loadPage(data);
            return await this.linkPreviewService.generatePreviewInfo(
                page,
                url as string
            );
        } catch (error) {
            throw new BadRequestException("Сайт не найден: " + url);
        }
    }
}
