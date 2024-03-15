import { createSlice } from "@reduxjs/toolkit";
// interfaces
import { checkIsMessage, IRoomSlice } from "@/models/room/IRoom.store";
// actions
import {
    createRoom,
    createSocketInstance,
    getAll,
    getPreviews,
    joinRoom,
} from "@/store/thunks/room";
import {
    addOrUpdateRoomSocket,
    addRoomOnFolder,
    clearPreviewRooms,
    excludeRoomFromFolder,
    handleChangeUserTypingSocket,
    handleDeletedMessageSocket,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageRead,
    handleMessageSocket,
    handlePinnedMessageSocket,
    setUserId,
} from "@/store/actions/room";
import { FetchingStatus } from "@/hooks/useFetch.hook";

const initialState: IRoomSlice = {
    userId: "",
    local: {
        rooms: {
            byId: {},
        },
        allIds: [],
    },
    previews: {
        status: FetchingStatus.IDLE,
        rooms: [],
    },
    socket: null,
};

const room = createSlice({
    name: "room",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(excludeRoomFromFolder, (state, action) => {
                state.local.rooms.byId[action.payload.roomId].folderIds =
                    state.local.rooms.byId[
                        action.payload.roomId
                    ].folderIds.filter(
                        (folderId) => folderId !== action.payload.folderId,
                    );
            })
            .addCase(addRoomOnFolder, (state, action) => {
                state.local.rooms.byId[action.payload.roomId].folderIds.push(
                    action.payload.folderId,
                );
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.local = {
                    rooms: action.payload.values,
                    allIds: action.payload.allIds,
                };
            })
            .addCase(getPreviews.pending, (state) => {
                state.previews = {
                    ...state.previews,
                    status: FetchingStatus.FETCHING,
                };
            })
            .addCase(getPreviews.fulfilled, (state, action) => {
                state.previews = {
                    status: FetchingStatus.FULFILLED,
                    rooms: action.payload,
                };
            })
            .addCase(clearPreviewRooms, (state) => {
                state.previews = {
                    status: FetchingStatus.IDLE,
                    rooms: [],
                };
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.local.allIds.push(action.payload.id);
                state.local.rooms.byId[action.payload.id] = action.payload;
            })
            .addCase(addOrUpdateRoomSocket, (state, action) => {
                state.local.allIds.push(action.payload.id);
                state.local.rooms.byId[action.payload.id] = action.payload;
            })
            .addCase(joinRoom.fulfilled, (state, action) => {
                state.local.allIds.push(action.payload.id);
                state.local.rooms.byId[action.payload.id] = action.payload;
            })
            .addCase(setUserId, (state, action) => {
                state.userId = action.payload;
            })
            .addCase(createSocketInstance.fulfilled, (state, action) => {
                // @ts-ignore
                state.socket = action.payload;
            })
            .addCase(handleMessageRead, (state, action) => {
                const targetChat =
                    state.local.rooms.byId[action.payload.roomId];

                const targetMessage = targetChat.days[
                    action.payload.message.date
                ].find((message) => message.id === action.payload.message.id);
                if (!targetMessage) {
                    return;
                }
                targetMessage.hasRead = true;
            })
            .addCase(handleMessageSocket, (state, action) => {
                const messagesByDays =
                    state.local.rooms.byId[action.payload.message.roomId];

                if (!messagesByDays.days[action.payload.date]) {
                    messagesByDays.days[action.payload.date] = [
                        action.payload.message,
                    ];
                }
                else {
                    messagesByDays.days[action.payload.date].push(
                        action.payload.message,
                    );
                }
            })
            .addCase(handleForwardedMessageSocket, (state, action) => {
                state.local.rooms.byId[action.payload.message.roomId].days[
                    action.payload.date
                ].push(action.payload.message);
            })
            .addCase(handlePinnedMessageSocket, (state, action) => {
                state.local.rooms.byId[action.payload.roomId].pinnedMessages =
                    action.payload.messages;
            })
            .addCase(handleEditedMessageSocket, (state, action) => {
                const targetChat =
                    state.local.rooms.byId[action.payload.roomId];

                const targetMessage = targetChat.days[
                    action.payload.message.date
                ].find((chat) => chat.id === action.payload.message.id);

                if (!targetMessage) {
                    return;
                }

                targetMessage.text = action.payload.message.text;
                targetMessage.updatedAt = action.payload.message.updatedAt;

                action.payload.dependentMessages.forEach((dependentMessage) => {
                    const msg = targetChat.days[dependentMessage.date].find(
                        (msg) => dependentMessage.id === msg.id,
                    );
                    if (msg) {
                        if (checkIsMessage(msg)) {
                            msg.replyToMessage!.updatedAt =
                                action.payload.message.updatedAt;
                            msg.replyToMessage!.text =
                                action.payload.message.text;
                        }
                        else {
                            msg.forwardedMessage.updatedAt =
                                action.payload.message.updatedAt;
                            msg.forwardedMessage.text =
                                action.payload.message.text;
                        }
                    }
                });
            })
            .addCase(handleDeletedMessageSocket, (state, action) => {
                const targetChat =
                    state.local.rooms.byId[action.payload.roomId];

                const targetMessage = targetChat.days[
                    action.payload.message.date
                ].find((chat) => chat.id === action.payload.message.id);

                if (!targetMessage) {
                    return;
                }
                targetMessage.isDeleted = action.payload.isDeleted;

                action.payload.dependentMessages.forEach((dependentMessage) => {
                    const msg = targetChat.days[dependentMessage.date].find(
                        (msg) => dependentMessage.id === msg.id,
                    );
                    if (msg) {
                        if (checkIsMessage(msg)) {
                            msg.replyToMessage!.isDeleted = true;
                        }
                        else {
                            msg.forwardedMessage.isDeleted = true;
                        }
                    }
                });
            })
            .addCase(handleChangeUserTypingSocket, (state, action) => {
                const targetChat =
                    state.local.rooms.byId[action.payload[0].roomId];

                targetChat.participants = action.payload;
            });
    },
});

const { reducer } = room;

export default reducer;
