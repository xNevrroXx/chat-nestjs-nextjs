import {
    IFolder,
    TAddRoom,
    TCreateFolder,
    TExcludeRoom,
    TRemoveFolder,
} from "@/models/rooms-on-folders/IRoomOnFolders.store";
import $api from "@/http";
import { AxiosResponse } from "axios";
import { TNormalizedList } from "@/models/other/TNormalizedList";

class RoomsOnFoldersService {
    protected static base = "/folders";

    static async getAll(): Promise<AxiosResponse<TNormalizedList<IFolder>>> {
        return $api.get<TNormalizedList<IFolder>>(this.base + "/all");
    }

    static async createFolder(
        data: TCreateFolder,
    ): Promise<AxiosResponse<IFolder>> {
        return $api.post<IFolder>(this.base + "/create", data);
    }

    static async removeFolder(
        data: TRemoveFolder,
    ): Promise<AxiosResponse<void>> {
        return $api.delete(this.base + "/remove", { data });
    }

    static async addRoom(data: TAddRoom): Promise<AxiosResponse<void>> {
        return $api.post(this.base + "/add-room", data);
    }

    static async excludeRoom(data: TExcludeRoom): Promise<AxiosResponse<void>> {
        return $api.delete(this.base + "/exclude-room", { data });
    }
}

export { RoomsOnFoldersService };
