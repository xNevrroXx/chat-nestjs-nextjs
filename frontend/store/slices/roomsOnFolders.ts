import { IRoomOnFoldersSlice } from "@/models/rooms-on-folders/IRoomOnFolders.store";
import { createSlice } from "@reduxjs/toolkit";
import {
    addRoomOnFolder,
    createFolder,
    excludeRoomFromFolder,
    getAllFolders,
    removeFolder,
} from "@/store/thunks/roomsOnFolders";
import {
    changeCurrentFolder,
    excludeRoomFromFolders,
} from "@/store/actions/roomsOnFolders";

const initialState: IRoomOnFoldersSlice = {
    folders: {
        byId: {},
    },
    allIds: [],
    current: null,
};

const roomsOnFolders = createSlice({
    name: "folders",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(changeCurrentFolder, (store, action) => {
                store.current = action.payload;
            })
            .addCase(getAllFolders.fulfilled, (store, action) => {
                store.folders = action.payload.values;
                store.allIds = action.payload.allIds;
            })
            .addCase(createFolder.fulfilled, (store, action) => {
                store.folders.byId[action.payload.id] = action.payload;
                store.allIds.push(action.payload.id);
            })
            .addCase(removeFolder.fulfilled, (store, action) => {
                delete store.folders.byId[action.payload.folderId];
                store.allIds = store.allIds.filter(
                    (id) => id !== action.payload.folderId,
                );
                if (store.current === action.payload.folderId) {
                    store.current = null;
                }
            })
            .addCase(addRoomOnFolder.fulfilled, (store, action) => {
                store.folders.byId[action.payload.folderId].roomIds.push(
                    action.payload.roomId,
                );
            })
            .addCase(excludeRoomFromFolder.fulfilled, (store, action) => {
                store.folders.byId[action.payload.folderId].roomIds =
                    store.folders.byId[action.payload.folderId].roomIds.filter(
                        (roomId) => roomId !== action.payload.roomId,
                    );
            })
            .addCase(excludeRoomFromFolders, (store, action) => {
                const exclusionRoom = action.payload;
                store.allIds.forEach((folderId) => {
                    const isContain =
                        store.folders.byId[folderId].roomIds.includes(
                            exclusionRoom,
                        );

                    if (isContain) {
                        store.folders.byId[folderId].roomIds =
                            store.folders.byId[folderId].roomIds.filter(
                                (roomId) => roomId !== exclusionRoom,
                            );
                    }
                });
            });
    },
});

const { reducer } = roomsOnFolders;

export default reducer;
