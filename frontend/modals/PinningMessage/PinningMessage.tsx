import React, { useCallback } from "react";
import { Modal } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { closeModals } from "@/store/actions/modal-windows";
import { pinMessageSocket } from "@/store/thunks/room";

const PinningMessage = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.pinningMessage,
    );

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOk = useCallback(() => {
        if (!modalInfo.isOpen) {
            return;
        }

        void dispatch(
            pinMessageSocket({
                messageId: modalInfo.messageId,
            }),
        );

        onClose();
    }, [dispatch, modalInfo, onClose]);

    return (
        <Modal
            title="Вы хотели бы закрепить сообщение?"
            open={modalInfo.isOpen}
            onOk={onOk}
            onCancel={onClose}
        />
    );
};

export default PinningMessage;
