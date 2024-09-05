import { createAction } from "@reduxjs/toolkit";
import {
    IOpenCallModal,
    IOpenForwardingModal,
    IOpenModal,
} from "@/models/modal-windows/modal-windows.store";

const openModal = createAction<IOpenModal>("modal-windows/open-modal");
const closeModals = createAction("modal-windows/close");

const openMessageForwardingModal = createAction<IOpenForwardingModal>(
    "modal-windows/open-message-forwarding-modal",
);

const openCallModal = createAction<IOpenCallModal>(
    "modal-windows/open-call-modal",
);

export { openModal, closeModals, openMessageForwardingModal, openCallModal };
