import axios, {AxiosResponse} from "axios";
import {ILinkPreviewInfo} from "../models/IResponse/ILinkPreviewInfo.ts";
import {API_URL} from "../http";

class LinkPreviewService {
    protected static base = "/link-preview";

    static async get(): Promise<AxiosResponse<ILinkPreviewInfo>> {
        return axios.get<ILinkPreviewInfo>(API_URL + "/" + this.base);
    }
}

export {LinkPreviewService};