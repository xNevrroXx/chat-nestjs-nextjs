import { createAction } from "@reduxjs/toolkit";
import {
    IOpenModalWithRoomId,
    IOpenModalWithMessageId,
    IOpenModal,
    TOpenModalDeletion,
} from "@/models/modal-windows/modal-windows.store";

const openModal = createAction<IOpenModal>("modal-windows/open");
const closeModals = createAction("modal-windows/close");

const openMessageForwardingModal = createAction<IOpenModalWithMessageId>(
    "modal-windows/open-message-forwarding",
);

const openPinningMessageModal = createAction<IOpenModalWithMessageId>(
    "modal-windows/open-pinning-message",
);

const openDeletingMessageModal = createAction<TOpenModalDeletion>(
    "modal-windows/open-deleting-message",
);

const openCallModal = createAction<IOpenModalWithRoomId>(
    "modal-windows/open-call",
);

export {
    openModal,
    closeModals,
    openCallModal,
    openPinningMessageModal,
    openDeletingMessageModal,
    openMessageForwardingModal,
};
