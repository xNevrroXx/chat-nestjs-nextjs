import { useCallback } from "react";
import { Modal } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { logout } from "@/store/thunks/authentication";
import { closeModals } from "@/store/actions/modal-windows";

const Logout = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector((state) => state.modalWindows.logout);

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOk = useCallback(() => {
        void dispatch(logout());
        onClose();
    }, [dispatch, onClose]);

    return (
        <Modal
            title="Выйти"
            open={modalInfo.isOpen}
            onOk={onOk}
            onCancel={onClose}
        ></Modal>
    );
};

export default Logout;
