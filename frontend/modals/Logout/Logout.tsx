import { useCallback } from "react";
import { Modal } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { logout } from "@/store/thunks/authentication";
import { closeModals } from "@/store/actions/modal-windows";
import { modalInfoSelector } from "@/store/selectors/modalInfo.selector";

const Logout = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector((state) =>
        modalInfoSelector(state, "logout"),
    );

    const onLogout = useCallback(() => {
        void dispatch(logout());
    }, [dispatch]);

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    return (
        <Modal
            title="Выйти"
            open={modalInfo.isOpen}
            onOk={onLogout}
            onCancel={onClose}
        ></Modal>
    );
};

export default Logout;
