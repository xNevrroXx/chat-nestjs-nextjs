import { createAsyncThunk } from "@reduxjs/toolkit";
import { IRoom, TJoinRoom } from "@/models/room/IRoom.store";
import { TRootState } from "@/store";
import { joinRoom } from "@/store/thunks/room";
import { addRecentRoomData } from "@/store/actions/recent-rooms";
import {
    IRecentRoom,
    TUpdateMessageForAction,
} from "@/models/recent-rooms/IRecentRooms.store";
import { MessageProcessedService } from "@/services/MessageProcessed.service";
import {
    IResponseGetAllRecentRoomInfo,
    TDeleteProcessedFile,
} from "@/models/recent-rooms/recent-rooms.response";

const getAll = createAsyncThunk<
    IResponseGetAllRecentRoomInfo,
    void,
    { state: TRootState }
>("recent-rooms/get-all", async (_, thunkAPI) => {
    try {
        const response = await MessageProcessedService.getAll();
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const joinRoomAndSetActive = createAsyncThunk<
    IRoom,
    TJoinRoom,
    { state: TRootState }
>("recent-rooms/join-and-set-active", async (roomData, thunkAPI) => {
    try {
        const newRoom = await thunkAPI.dispatch(joinRoom(roomData)).unwrap();
        thunkAPI.dispatch(addRecentRoomData({ id: newRoom.id }));
        return newRoom;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const updateOnServerRecentRoomData = createAsyncThunk<
    void,
    Pick<IRecentRoom, "roomId">,
    { state: TRootState }
>("recent-rooms/server:update-input", async (data, thunkAPI) => {
    try {
        const recentRoomsData = thunkAPI.getState().recentRooms;
        if (!recentRoomsData.allIds.includes(data.roomId)) {
            return;
        }
        const targetRoomData = recentRoomsData.rooms.byId[data.roomId];

        await MessageProcessedService.update({
            roomId: targetRoomData.roomId,
            text: !targetRoomData.input.isAudioRecord
                ? targetRoomData.input.text
                : null,
            messageForAction: targetRoomData.input.messageForAction && {
                action: targetRoomData.input.messageForAction.action,
                id: targetRoomData.input.messageForAction.message.id,
            },
        });
        return;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const updateMessageForAction = createAsyncThunk<
    TUpdateMessageForAction,
    TUpdateMessageForAction & { roomId: string },
    { state: TRootState }
>("recent-rooms/update-message-for-action", (data, thunkAPI) => {
    try {
        const { roomId, ...otherData } = data;

        void MessageProcessedService.update({
            roomId,
            messageForAction: otherData.messageForAction && {
                id: otherData.messageForAction.message.id,
                action: otherData.messageForAction.action,
            },
        });

        return otherData;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const deleteUploadedFile = createAsyncThunk<
    TDeleteProcessedFile,
    TDeleteProcessedFile,
    { state: TRootState }
>("recent-rooms/remove-uploaded-file", async (data, thunkAPI) => {
    try {
        await MessageProcessedService.deleteWaitedFile(data);
        return data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export {
    getAll as getAllRecentInputInfo,
    updateOnServerRecentRoomData,
    updateMessageForAction,
    joinRoomAndSetActive,
    deleteUploadedFile,
};
