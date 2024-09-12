import { createAsyncThunk } from "@reduxjs/toolkit";
import { IRoom, TJoinRoom } from "@/models/room/IRoom.store";
import { TRootState } from "@/store";
import { joinRoom } from "@/store/thunks/room";
import { addRecentRoomData } from "@/store/actions/recent-rooms";

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

export { joinRoomAndSetActive };
