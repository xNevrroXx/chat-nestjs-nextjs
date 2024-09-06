import { createAction } from "@reduxjs/toolkit";
import {
    IOpenCallModal,
    IOpenForwardingModal,
    IOpenModal,
    IOpenPinningMessageModal,
} from "@/models/modal-windows/modal-windows.store";

const openModal = createAction<IOpenModal>("modal-windows/open");
const closeModals = createAction("modal-windows/close");

const openMessageForwardingModal = createAction<IOpenForwardingModal>(
    "modal-windows/open-message-forwarding",
);

const openPinningMessageModal = createAction<IOpenPinningMessageModal>(
    "modal-windows/open-pinning-message",
);

const openCallModal = createAction<IOpenCallModal>("modal-windows/open-call");

export {
    openModal,
    closeModals,
    openMessageForwardingModal,
    openCallModal,
    openPinningMessageModal,
};
