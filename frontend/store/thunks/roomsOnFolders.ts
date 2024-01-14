import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    IFolder,
    TAddRoom,
    TCreateFolder,
    TExcludeRoom,
    TRemoveFolder,
} from "@/models/rooms-on-folders/IRoomOnFolders.store";
import { RoomsOnFoldersService } from "@/services/RoomsOnFolders.service";
import { TNormalizedList } from "@/models/other/TNormalizedList";

const getAll = createAsyncThunk<TNormalizedList<IFolder>, void>(
    "folders/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await RoomsOnFoldersService.getAll();

            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const createFolder = createAsyncThunk<IFolder, TCreateFolder>(
    "folders/create",
    async (data, thunkAPI) => {
        try {
            const response = await RoomsOnFoldersService.createFolder(data);

            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const removeFolder = createAsyncThunk<TRemoveFolder, TRemoveFolder>(
    "folders/remove",
    async (data, thunkAPI) => {
        try {
            await RoomsOnFoldersService.removeFolder(data);
            return data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const addRoom = createAsyncThunk<TAddRoom, TAddRoom>(
    "folders/add-room",
    async (data, thunkAPI) => {
        try {
            await RoomsOnFoldersService.addRoom(data);
            return data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const excludeRoom = createAsyncThunk<TExcludeRoom, TExcludeRoom>(
    "folders/exclude-room",
    async (data, thunkAPI) => {
        try {
            await RoomsOnFoldersService.excludeRoom(data);
            return data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

export {
    getAll as getAllFolders,
    createFolder,
    removeFolder,
    addRoom as addRoomToFolder,
    excludeRoom as excludeRoomFromFolder,
};
