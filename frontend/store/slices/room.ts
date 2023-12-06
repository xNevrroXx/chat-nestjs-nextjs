import {createSlice} from "@reduxjs/toolkit";
// interfaces
import {IRoomSlice} from "@/models/IStore/IRoom";
// actions
import {
    getAll,
    createRoom,
    createSocketInstance, joinRoom
} from "@/store/thunks/room";
import {
    setUserId,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageSocket,
    handleChangeUserTypingSocket,
    handleDeletedMessageSocket,
    handlePinnedMessageSocket
} from "@/store/actions/room";


const initialState: IRoomSlice = {
    userId: "",
    rooms: [],
    socket: null
};

const room = createSlice({
    name: "room",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getAll.fulfilled, (state, action) => {
                state.rooms = action.payload;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.rooms.push(action.payload);
            })
            .addCase(joinRoom.fulfilled, (state, action) => {
                state.rooms.push(action.payload);
            })
            .addCase(setUserId, (state, action) => {
                state.userId = action.payload;
            })
            .addCase(createSocketInstance.fulfilled, (state, action) => {
                // @ts-ignore
                state.socket = action.payload;
            })
            .addCase(handleMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                targetChat!.messages.push(action.payload);
            })
            .addCase(handleForwardedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                targetChat!.messages.push(action.payload);
            })
            .addCase(handlePinnedMessageSocket, (state, action) => {
                const targetRoom = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetRoom) return;

                targetRoom.pinnedMessages = action.payload.messages;
            })
            .addCase(handleEditedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetChat) return;

                const targetMessage = targetChat.messages.find(chat => chat.id === action.payload.messageId);
                if (!targetMessage) return;
                targetMessage.text = action.payload.text;
                targetMessage.updatedAt = action.payload.updatedAt;
            })
            .addCase(handleDeletedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetChat) return;

                const targetMessage = targetChat.messages.find(chat => chat.id === action.payload.messageId);
                if (!targetMessage) return;
                targetMessage.isDeleted = action.payload.isDeleted;
            })
            .addCase(handleChangeUserTypingSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload[0].roomId);
                if (!targetChat) {
                    return;
                }

                targetChat.participants = action.payload;
            });
    }
});

const {reducer} = room;

export default reducer;
