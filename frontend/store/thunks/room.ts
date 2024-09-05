import { createAsyncThunk } from "@reduxjs/toolkit";
// services
import { RoomService } from "@/services/Room.service";
import { SocketIOService } from "@/services/SocketIO.service";
// actions
import {
    addOrUpdateRoomSocket,
    clearPreviewRooms,
    handleChangeUserTypingSocket,
    handleDeletedMessageSocket,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageRead,
    handleMessageSocket,
    handlePinnedMessageSocket,
} from "../actions/room";
import { handleChangeUserOnlineSocket } from "../actions/users";
// types
import {
    IDeleteMessage,
    IEditMessage,
    IForwardMessage,
    IPinMessage,
    IRoom,
    TCreateGroupRoom,
    TSendMessage,
    TSendUserTyping,
    TPreviewExistingRoom,
    IMessageRead,
    IInnerStandardMessage,
    IInnerForwardedMessage,
} from "@/models/room/IRoom.store";
import { TRootState } from "@/store";
import { TValueOf } from "@/models/TUtils";
import { excludeRoomFromFolders } from "@/store/actions/rooms-on-folders";
import { removeRecentRoomData } from "@/store/actions/recent-rooms";
import { MessageService } from "@/services/Message.service";

const createSocketInstance = createAsyncThunk<
    SocketIOService,
    string,
    { state: TRootState }
>("room/socket:create-instance", (sessionId: string, thunkAPI) => {
    try {
        const socket = new SocketIOService(sessionId);
        void thunkAPI.dispatch(connectSocket());
        return socket;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const connectSocket = createAsyncThunk<void, void, { state: TRootState }>(
    "room/socket:connect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().room.socket;
            await socket?.connect();

            socket?.on("user:toggle-online", (data) => {
                thunkApi.dispatch(handleChangeUserOnlineSocket(data));
            });
            socket?.on("room:toggle-typing", (data) => {
                thunkApi.dispatch(handleChangeUserTypingSocket(data));
            });
            socket?.on("message:read", (data) => {
                thunkApi.dispatch(handleMessageRead(data));
            });
            socket?.on("message:standard", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });
            socket?.on("message:pinned", (data) => {
                thunkApi.dispatch(handlePinnedMessageSocket(data));
            });
            socket?.on("message:edited", (data) => {
                thunkApi.dispatch(handleEditedMessageSocket(data));
            });
            socket?.on("message:deleted", (data) => {
                thunkApi.dispatch(handleDeletedMessageSocket(data));
            });
            socket?.on("message:forwarded", (data) => {
                thunkApi.dispatch(handleForwardedMessageSocket(data));
            });
            socket?.on("room:add-or-update", (data) => {
                thunkApi.dispatch(addOrUpdateRoomSocket(data));
            });
        }
        catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    },
);

const disconnectSocket = createAsyncThunk<void, void, { state: TRootState }>(
    "room/socket:disconnect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().room.socket;
            await socket?.disconnect();
            return;
        }
        catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    },
);

const readMessageSocket = createAsyncThunk<
    void,
    IMessageRead,
    { state: TRootState }
>("room/socket:message-read", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:read", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const sendMessageSocket = createAsyncThunk<
    void,
    TSendMessage,
    { state: TRootState }
>("room/socket:send-message", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:standard", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const pinMessageSocket = createAsyncThunk<
    void,
    IPinMessage,
    { state: TRootState }
>("room/socket:pin-message", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:pin", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const editMessageSocket = createAsyncThunk<
    void,
    IEditMessage,
    { state: TRootState }
>("room/socket:edit-message", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:edit", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const deleteMessageSocket = createAsyncThunk<
    void,
    IDeleteMessage,
    { state: TRootState }
>("room/socket:delete-message", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:delete", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const forwardMessageSocket = createAsyncThunk<
    void,
    IForwardMessage,
    { state: TRootState }
>("room/socket:forward-message", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("message:forward", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const toggleUserTypingSocket = createAsyncThunk<
    void,
    TSendUserTyping,
    { state: TRootState }
>("room/socket:send-toggle-typing", (data, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }

        socket.emit("user:toggle-typing", [data]);
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const getMessageById = createAsyncThunk<
    IInnerStandardMessage | IInnerForwardedMessage,
    string
>("room/get-message-by-id", async (messageId, thunkAPI) => {
    try {
        const response = await MessageService.getById(messageId);
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const getAll = createAsyncThunk("room/get-all", async (_, thunkAPI) => {
    try {
        const response = await RoomService.getAll();
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const getPreviews = createAsyncThunk<
    TPreviewExistingRoom[],
    string,
    { state: TRootState }
>("room/get-previews", async (inputQueryString, thunkAPI) => {
    try {
        const response = await RoomService.getPreviewsByQuery(inputQueryString);

        const actualQueryString = thunkAPI.getState().room.queryString;

        if (!actualQueryString || inputQueryString !== actualQueryString) {
            return thunkAPI.rejectWithValue(null);
        }

        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const createRoom = createAsyncThunk<
    IRoom,
    TCreateGroupRoom,
    { state: TRootState }
>("room/create", async (newRoomData, thunkAPI) => {
    try {
        const response = await RoomService.create(newRoomData);

        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }
        socket.emit("room:join-or-create", [{ id: response.data.id }]);

        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const joinRoom = createAsyncThunk<
    IRoom,
    TPreviewExistingRoom,
    { state: TRootState }
>("room/join", async (roomData, thunkAPI) => {
    try {
        const response = await RoomService.join(roomData);

        const socket = thunkAPI.getState().room.socket;
        if (!socket) {
            throw new Error("There is no socket");
        }
        socket.emit("room:join-or-create", [{ id: response.data.id }]);

        thunkAPI.dispatch(clearPreviewRooms());
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const leaveRoom = createAsyncThunk<
    TValueOf<Pick<IRoom, "id">>,
    TValueOf<Pick<IRoom, "id">>,
    { state: TRootState }
>("room/leave", (roomId, thunkAPI) => {
    try {
        const socket = thunkAPI.getState().room.socket;

        if (!socket) {
            throw new Error("There is no socket");
        }

        thunkAPI.dispatch(removeRecentRoomData(roomId));
        thunkAPI.dispatch(excludeRoomFromFolders(roomId));
        socket.emit("room:leave", [{ roomId }]);
        return roomId;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const clearMyHistory = createAsyncThunk<
    TValueOf<Pick<IRoom, "id">>,
    TValueOf<Pick<IRoom, "id">>,
    { state: TRootState }
>("room/clear-my-history", async (roomId, thunkAPI) => {
    try {
        await RoomService.clearMyHistory({ roomId });

        return roomId;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export {
    getAll,
    getPreviews,
    getMessageById,
    joinRoom,
    leaveRoom,
    createRoom,
    clearMyHistory,
    createSocketInstance,
    disconnectSocket,
    connectSocket,
    readMessageSocket,
    sendMessageSocket,
    pinMessageSocket,
    editMessageSocket,
    deleteMessageSocket,
    forwardMessageSocket,
    toggleUserTypingSocket,
};
