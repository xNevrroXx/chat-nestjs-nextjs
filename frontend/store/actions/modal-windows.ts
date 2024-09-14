import { createAction } from "@reduxjs/toolkit";
import {
    IOpenModalWithRoomId,
    IOpenModal,
    TOpenModalDeletion,
    IOpenModalWithMessageId,
} from "@/models/modal-windows/modal-windows.store";

const openModal = createAction<IOpenModal>("modal-windows/open");
const closeModals = createAction("modal-windows/close");

const openModalWithRoomId = createAction<IOpenModalWithRoomId>(
    "modal-windows/open-with-room-id",
);

const openModalWithMessageId = createAction<IOpenModalWithMessageId>(
    "modal-windows/open-with-message-id",
);

const openDeletingMessageModal = createAction<TOpenModalDeletion>(
    "modal-windows/open-deleting-message",
);

export {
    openModal,
    closeModals,
    openModalWithRoomId,
    openModalWithMessageId,
    openDeletingMessageModal,
};
