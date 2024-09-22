import { createSlice } from "@reduxjs/toolkit";
import {
    IRecentRoom,
    IRecentRoomInputStandard,
    IRecentRoomInputWithMessageForAction,
    IRecentRooms,
} from "@/models/recent-rooms/IRecentRooms.store";
import {
    addRecentRoomData,
    handleRecentMessage,
    removeRecentRoomData,
    resetCurrentRoomId,
    updateRecentRoomData,
} from "@/store/actions/recent-rooms";
import {
    deleteUploadedFile,
    getAllRecentInputInfo,
    updateMessageForAction,
} from "@/store/thunks/recent-rooms";
import { TValueOf } from "@/models/TUtils";

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
                        roomId: action.payload.id,
                        isPreview: action.payload.isPreview
                            ? action.payload.isPreview
                            : false,
                        input: {
                            isAudioRecord: false,
                            text: "",
                            files: [],
                            uploadedFiles: [],
                            messageForAction: null,
                        },
                    };
                }

                state.currentRoomId = action.payload.id;
            })
            .addCase(updateRecentRoomData, (state, action) => {
                if (!state.currentRoomId) {
                    return;
                }
                const recentRoomInfo = state.rooms.byId[state.currentRoomId];
                if (
                    (recentRoomInfo.input.isAudioRecord &&
                        !action.payload.input.isAudioRecord) ||
                    (!recentRoomInfo.input.isAudioRecord &&
                        action.payload.input.isAudioRecord)
                ) {
                    recentRoomInfo.input = {
                        messageForAction: recentRoomInfo.input.messageForAction,
                        ...action.payload.input,
                    } as TValueOf<Pick<IRecentRoom, "input">>;

                    if (
                        !action.payload.input.isAudioRecord &&
                        !action.payload.input.uploadedFiles
                    ) {
                        if (
                            !recentRoomInfo.input.isAudioRecord &&
                            recentRoomInfo.input.uploadedFiles
                        ) {
                            (
                                recentRoomInfo.input as IRecentRoomInputWithMessageForAction &
                                    IRecentRoomInputStandard
                            ).uploadedFiles =
                                recentRoomInfo.input.uploadedFiles;
                        }
                        else {
                            (
                                recentRoomInfo.input as IRecentRoomInputWithMessageForAction &
                                    IRecentRoomInputStandard
                            ).uploadedFiles = [];
                        }
                    }
                    return;
                }

                state.rooms.byId[state.currentRoomId].input = {
                    ...state.rooms.byId[state.currentRoomId].input,
                    ...action.payload.input,
                } as TValueOf<Pick<IRecentRoom, "input">>;
                if (
                    !action.payload.input.isAudioRecord &&
                    !action.payload.input.uploadedFiles
                ) {
                    if (
                        !recentRoomInfo.input.isAudioRecord &&
                        recentRoomInfo.input.uploadedFiles
                    ) {
                        (
                            recentRoomInfo.input as IRecentRoomInputWithMessageForAction &
                                IRecentRoomInputStandard
                        ).uploadedFiles = recentRoomInfo.input.uploadedFiles;
                    }
                    else {
                        (
                            recentRoomInfo.input as IRecentRoomInputWithMessageForAction &
                                IRecentRoomInputStandard
                        ).uploadedFiles = [];
                    }
                }
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
            })
            .addCase(getAllRecentInputInfo.fulfilled, (state, action) => {
                action.payload.recentInputInfo.forEach((info) => {
                    state.allIds.push(info.roomId);
                    state.rooms.byId[info.roomId] = {
                        roomId: info.roomId,
                        isPreview: false,
                        input: info.input,
                    };
                });
            })
            .addCase(handleRecentMessage, (state, action) => {
                if (state.currentRoomId === action.payload.roomId) {
                    return;
                }
                else if (!state.allIds.includes(action.payload.roomId)) {
                    state.allIds.push(action.payload.roomId);
                }

                state.rooms.byId[action.payload.roomId] = {
                    roomId: action.payload.roomId,
                    isPreview: false,
                    input: {
                        isAudioRecord: false,
                        text: action.payload.text || "",
                        files: [],
                        uploadedFiles: action.payload.uploadedFiles,
                        messageForAction: action.payload.messageForAction
                            ? action.payload.messageForAction
                            : null,
                    },
                };
            })
            .addCase(deleteUploadedFile.fulfilled, (state, action) => {
                if (!state.currentRoomId) {
                    return;
                }

                const roomInputInfo = state.rooms.byId[state.currentRoomId];
                if (roomInputInfo.input.isAudioRecord) {
                    return;
                }

                roomInputInfo.input.uploadedFiles =
                    roomInputInfo.input.uploadedFiles.filter(
                        (file) => file.id !== action.payload.fileId,
                    );
            });
    },
});

const { reducer } = recentRooms;
export default reducer;
