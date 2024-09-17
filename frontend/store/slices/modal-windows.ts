import { createSlice } from "@reduxjs/toolkit";
import {
    openModal,
    closeModals,
    openModalWithRoomId,
    openModalWithMessageId,
    openDeletingMessageModal,
} from "@/store/actions/modal-windows";
import { TModalWindowsStore } from "@/models/modal-windows/modal-windows.store";

const initialState: TModalWindowsStore = {
    call: {
        isOpen: false,
    },
    logout: {
        isOpen: false,
    },
    foldersMenu: {
        isOpen: false,
    },
    roomDeletion: {
        isOpen: false,
    },
    folderCreation: {
        isOpen: false,
    },
    accountDeletion: {
        isOpen: false,
    },
    groupCreationMenu: {
        isOpen: false,
    },
    pinningMessage: {
        isOpen: false,
    },
    messageForwarding: {
        isOpen: false,
    },
    messageDeletion: {
        isOpen: false,
    },
    invitationUsers: {
        isOpen: false,
    },
};

const modalWindows = createSlice({
    name: "modal-windows",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(openModal, (state, action) => {
                if (action.payload.closeOthers) {
                    for (const modalName of Object.keys(
                        state,
                    ) as (keyof TModalWindowsStore)[]) {
                        state[modalName].isOpen = false;
                    }
                }

                state[action.payload.modalName].isOpen = true;
            })
            .addCase(closeModals, (state) => {
                for (const modalName of Object.keys(
                    state,
                ) as (keyof TModalWindowsStore)[]) {
                    state[modalName].isOpen = false;
                }
            })
            .addCase(openModalWithRoomId, (state, action) => {
                state[action.payload.modalName] = {
                    isOpen: true,
                    roomId: action.payload.roomId,
                };
            })
            .addCase(openModalWithMessageId, (state, action) => {
                state[action.payload.modalName] = {
                    isOpen: true,
                    messageId: action.payload.messageId,
                };
            })
            .addCase(openDeletingMessageModal, (state, action) => {
                state.messageDeletion = {
                    isOpen: true,
                    roomId: action.payload.roomId,
                    senderId: action.payload.senderId,
                    messageId: action.payload.messageId,
                };
            });
    },
});

const reducer = modalWindows.reducer;
export default reducer;
