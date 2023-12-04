import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {RoomService} from "@/services/RoomService";
import {SocketIOService} from "@/services/SocketIO.service";
// actions
import {
    handleChangeUserTypingSocket,
    handleDeletedMessageSocket,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageSocket,
    handlePinnedMessageSocket
} from "../actions/room";
import {handleChangeUserOnlineSocket} from "../actions/users";
// types
import {
    IDeleteMessage,
    IEditMessage,
    IForwardMessage,
    IPinMessage,
    IRoom, TCreateRoom,
    TSendMessage,
    TSendUserTyping,
    TTemporarilyRoomOrUserBySearch
} from "@/models/IStore/IRoom";
import {RootState} from "@/store";

const createSocketInstance = createAsyncThunk<SocketIOService, string, { state: RootState }>(
    "room/socket:create-instance",
    (sessionId: string, thunkAPI) => {
        try {
            const socket = new SocketIOService(sessionId);
            void thunkAPI.dispatch(connectSocket());
            return socket;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const connectSocket = createAsyncThunk<void, void, { state: RootState }>(
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
            socket?.on("message", (data) => {
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
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk<void, void, { state: RootState }>(
    "room/socket:disconnect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().room.socket;
            await socket?.disconnect();
            return;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const sendMessageSocket = createAsyncThunk<void, TSendMessage, { state: RootState }>(
    "room/socket:send-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const pinMessageSocket  = createAsyncThunk<void, IPinMessage, { state: RootState }>(
    "room/socket:pin-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:pin", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const editMessageSocket = createAsyncThunk<void, IEditMessage, { state: RootState }>(
    "room/socket:edit-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:edit", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const deleteMessageSocket = createAsyncThunk<void, IDeleteMessage, { state: RootState }>(
    "room/socket:delete-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:delete", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const forwardMessageSocket = createAsyncThunk<void, IForwardMessage, { state: RootState }>(
    "room/socket:forward-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:forward", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const toggleUserTypingSocket = createAsyncThunk<void, TSendUserTyping, { state: RootState }>(
    "room/socket:send-toggle-typing",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("user:toggle-typing", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const getAll = createAsyncThunk(
    "room/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await RoomService.getAll();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const createRoom = createAsyncThunk<IRoom, TTemporarilyRoomOrUserBySearch | TCreateRoom>(
    "room/create",
    async (newRoomData, thunkAPI) => {
        try {
            const response = await RoomService.create(newRoomData);
            return response.data;
        }
        catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {
    getAll,
    createRoom,

    createSocketInstance,
    disconnectSocket,
    connectSocket,
    sendMessageSocket,
    pinMessageSocket,
    editMessageSocket,
    deleteMessageSocket,
    forwardMessageSocket,
    toggleUserTypingSocket
};
