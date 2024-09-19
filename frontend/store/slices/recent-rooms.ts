import { createSlice } from "@reduxjs/toolkit";
import { IRecentRooms } from "@/models/recent-rooms/IRecentRooms.store";
import {
    addRecentRoomData,
    removeRecentRoomData,
    resetCurrentRoomId,
    updateRecentRoomData,
} from "@/store/actions/recent-rooms";
import { updateMessageForAction } from "@/store/thunks/recent-rooms";

const initialState: IRecentRooms = {
    rooms: {
        byId: {},
    },
    allIds: [],
    currentRoomId: null,
};

const recentRooms = createSlice({
    name: "recent-rooms",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addRecentRoomData, (state, action) => {
                const isExist = state.allIds.includes(action.payload.id);

                if (!isExist) {
                    state.allIds.push(action.payload.id);
                    state.rooms.byId[action.payload.id] = {
                        id: action.payload.id,
                        isPreview: action.payload.isPreview
                            ? action.payload.isPreview
                            : false,
                        input: {
                            isAudioRecord: false,
                            text: "",
                            files: [],
                            messageForAction: null,
                        },
                    };
                }

                state.currentRoomId = action.payload.id;
            })
            .addCase(updateRecentRoomData, (state, action) => {
                if (!state.allIds.includes(action.payload.id)) {
                    return;
                }

                state.rooms.byId[action.payload.id].input = {
                    messageForAction:
                        state.rooms.byId[action.payload.id].input
                            .messageForAction,
                    ...action.payload.input,
                };
            })
            .addCase(updateMessageForAction.fulfilled, (state, action) => {
                if (!state.currentRoomId) {
                    return;
                }

                state.rooms.byId[state.currentRoomId].input.messageForAction =
                    action.payload.messageForAction;
            })
            .addCase(removeRecentRoomData, (state, action) => {
                const index = state.allIds.indexOf(action.payload);
                if (index === -1) {
                    return;
                }
                else if (state.currentRoomId === action.payload) {
                    state.currentRoomId = null;
                }

                state.allIds.splice(index, 1);
                delete state.rooms.byId[action.payload];
            })
            .addCase(resetCurrentRoomId, (state) => {
                state.currentRoomId = null;
            });
    },
});

const { reducer } = recentRooms;
export default reducer;
