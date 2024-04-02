import { createSlice } from "@reduxjs/toolkit";
// interfaces
import { IRoomSlice } from "@/models/room/IRoom.store";
// actions
import {
    clearMyHistory,
    createRoom,
    createSocketInstance,
    getAll,
    getMessageById,
    getPreviews,
    joinRoom,
    leaveRoom,
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
    userLeftRoom,
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
    forwardedMessages: {
        byId: {},
        allIds: [],
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
            .addCase(getMessageById.fulfilled, (state, action) => {
                const message = action.payload;

                if (!state.forwardedMessages.allIds.includes(message.id)) {
                    state.forwardedMessages.allIds.push(message.id);
                }

                state.forwardedMessages.byId[message.id] = message;
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
            .addCase(leaveRoom.fulfilled, (state, action) => {
                state.local.allIds = state.local.allIds.filter(
                    (id) => id !== action.payload,
                );
                delete state.local.rooms.byId[action.payload];
            })
            .addCase(userLeftRoom, (state, action) => {
                state.local.rooms.byId[action.payload.roomId].participants.find(
                    (member) => member.userId === action.payload.userId,
                )!.isStillMember = false;
            })
            .addCase(clearMyHistory.fulfilled, (state, action) => {
                state.local.rooms.byId[action.payload].days = {};
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
                const date = action.payload.date;
                const message = action.payload.message;

                if (!state.local.rooms.byId[message.roomId].days[date]) {
                    state.local.rooms.byId[message.roomId].days[date] = [
                        message,
                    ];
                }
                else {
                    state.local.rooms.byId[message.roomId].days[date].push(
                        action.payload.message,
                    );
                }

                const forwardedMessage = action.payload.forwardedMessage;

                if (
                    !state.local.allIds.includes(forwardedMessage.roomId) &&
                    !state.forwardedMessages.allIds.includes(
                        forwardedMessage.id,
                    )
                ) {
                    state.forwardedMessages.allIds.push(forwardedMessage.id);
                    state.forwardedMessages.byId[forwardedMessage.id] =
                        forwardedMessage;
                }
                else if (
                    !state.forwardedMessages.allIds.includes(
                        forwardedMessage.id,
                    )
                ) {
                    state.forwardedMessages.allIds.push(forwardedMessage.id);
                    state.forwardedMessages.byId[forwardedMessage.id] =
                        forwardedMessage;
                }
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

                // action.payload.dependentMessages.forEach((dependentMessage) => {
                //     const msg = targetChat.days[dependentMessage.date].find(
                //         (msg) => dependentMessage.id === msg.id,
                //     );
                //     if (msg) {
                //         if (checkIsMessage(msg)) {
                //             msg.replyToMessage!.updatedAt =
                //                 action.payload.message.updatedAt;
                //             msg.replyToMessage!.text =
                //                 action.payload.message.text;
                //         }
                //         else {
                //             msg.forwardedMessage.updatedAt =
                //                 action.payload.message.updatedAt;
                //             msg.forwardedMessage.text =
                //                 action.payload.message.text;
                //         }
                //     }
                // });
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

                // action.payload.dependentMessages.forEach((dependentMessage) => {
                //     const msg = targetChat.days[dependentMessage.date].find(
                //         (msg) => dependentMessage.id === msg.id,
                //     );
                //     if (msg) {
                //         if (checkIsMessage(msg)) {
                //             msg.replyToMessage!.isDeleted = true;
                //         }
                //         else {
                //             msg.forwardedMessage.isDeleted = true;
                //         }
                //     }
                // });
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
