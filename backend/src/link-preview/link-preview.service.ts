import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import axios from "axios";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class LinkPreviewService {
    async getLinkInfo(url: string) {
        try {
            const { data } = await axios.get(url as string);
            const page = await this.loadPage(data);
            return await this.generatePreviewInfo(page, url as string);
        } catch (error) {
            throw new WsException("Информация о ссылке не найдена: " + url);
        }
    }

    async loadPage(url: string) {
        return cheerio.load(url);
    }

    async generatePreviewInfo($: cheerio.Root, url: string) {
        const data = {
            url,
            title: this.getTitle($),
            shortTitle: await this.getShortTitle($, url),
            favicon: this.getFavicon($),
            description: this.getDescription($),
            image: this.getImage($),
            author: this.getAuthor($),
        };

        return {
            url: data.url.trim(),
            title: data.title && data.title.trim(),
            shortTitle: data.shortTitle && data.shortTitle.trim(),
            favicon: data.favicon && data.favicon.trim(),
            description: data.description && data.description.trim(),
            image: data.image && data.image.trim(),
            author: data.author && data.author.trim(),
        };
    }

    getMetaTag($: cheerio.Root, name: string) {
        try {
            return (
                $(`meta[name=${name}]`).attr("content") ||
                $(`meta[propety="twitter${name}"]`).attr("content") ||
                $(`meta[property="og:${name}"]`).attr("content")
            );
        } catch (error) {
            return "";
        }
    }

    getTitle($: cheerio.Root) {
        try {
            return this.getMetaTag($, "title") || $("title").first().text();
        } catch {
            return "";
        }
    }

    async getShortTitle(
        $: cheerio.Root,
        url: string
    ): Promise<string | undefined> {
        try {
            const linkSearchElem = $("link[rel='search']");
            if (linkSearchElem.attr("title")) {
                return linkSearchElem.attr("title");
            }
            const searchXmlFileUrlPath = linkSearchElem.attr("href");
            if (!searchXmlFileUrlPath) return;

            const searchXmlFileUrl = new URL(url);
            searchXmlFileUrl.pathname = searchXmlFileUrlPath;

            const { data } = await axios.get(searchXmlFileUrl.href);
            const page = await this.loadPage(data);
            return page("ShortName").text();
        } catch {
            return "";
        }
    }

    getFavicon($: cheerio.Root) {
        try {
            return (
                $("link[rel='icon']").attr("href") ||
                $("link[rel='shortcut icon']").attr("href") ||
                $("link[rel='alternate icon']").attr("href")
            );
        } catch {
            return "";
        }
    }

    getDescription($: cheerio.Root) {
        try {
            return this.getMetaTag($, "description");
        } catch {
            return "";
        }
    }

    getImage($: cheerio.Root) {
        try {
            return this.getMetaTag($, "image");
        } catch {
            return "";
        }
    }

    getAuthor($: cheerio.Root) {
        try {
            return this.getMetaTag($, "author");
        } catch (error) {
            return "";
        }
    }
}
