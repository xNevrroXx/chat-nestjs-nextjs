import { createAsyncThunk } from "@reduxjs/toolkit";
import { IRoom, TJoinRoom } from "@/models/room/IRoom.store";
import { TRootState } from "@/store";
import { joinRoom } from "@/store/thunks/room";
import { addRecentRoomData } from "@/store/actions/recent-rooms";
import {
    TSendRecentMessageInfo,
    TUpdateMessageForAction,
} from "@/models/recent-rooms/IRecentRooms.store";
import { MessageProcessedService } from "@/services/MessageProcessed.service";

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

const updateRecentMessage = createAsyncThunk<
    void,
    TSendRecentMessageInfo,
    { state: TRootState }
>("recent-rooms/server:update-recent-message", async (data, thunkAPI) => {
    try {
        await MessageProcessedService.update(data);
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

export { joinRoomAndSetActive, updateRecentMessage, updateMessageForAction };
