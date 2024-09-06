import { createSlice } from "@reduxjs/toolkit";
import {
    closeModals,
    openCallModal,
    openMessageForwardingModal,
    openModal,
    openPinningMessageModal,
} from "@/store/actions/modal-windows";
import { TModalWindowsStore } from "@/models/modal-windows/modal-windows.store";

const initialState: TModalWindowsStore = {
    call: {
        isOpen: false,
        roomId: null,
    },
    logout: {
        isOpen: false,
    },
    foldersMenu: {
        isOpen: false,
    },
    folderCreation: {
        isOpen: false,
    },
    pinningMessage: {
        isOpen: false,
        messageId: null,
    },
    messageForwarding: {
        isOpen: false,
        forwardingMessageId: null,
    },
    groupCreationMenu: {
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
            .addCase(openMessageForwardingModal, (state, action) => {
                state.messageForwarding.isOpen = true;
                state.messageForwarding.forwardingMessageId =
                    action.payload.forwardingMessageId;
            })
            .addCase(openCallModal, (state, action) => {
                state.call.isOpen = true;
                state.call.roomId = action.payload.roomId;
            })
            .addCase(openPinningMessageModal, (state, action) => {
                state.pinningMessage.isOpen = true;
                state.pinningMessage.messageId = action.payload.messageId;
            });
    },
});

const reducer = modalWindows.reducer;
export default reducer;
