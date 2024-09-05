import { ChangeEvent, useCallback, useState } from "react";
import { Input, Modal } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { modalInfoSelector } from "@/store/selectors/modalInfo.selector";
import { closeModals } from "@/store/actions/modal-windows";
import { createFolder } from "@/store/thunks/roomsOnFolders";

const FolderCreation = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector((state) =>
        modalInfoSelector(state, "folderCreation"),
    );
    const [folderName, setFolderName] = useState<string>("");

    const onCreateFolder = useCallback(() => {
        void dispatch(createFolder({ name: folderName }));
    }, [dispatch, folderName]);

    const onChangeFolderName = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            if (!value) {
                return;
            }

            setFolderName(value);
        },
        [],
    );

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    return (
        <Modal
            title={"Новая папка"}
            onOk={onCreateFolder}
            onCancel={onClose}
            open={modalInfo.isOpen}
            width={"350px"}
        >
            <Input
                placeholder={"Название папки"}
                onChange={onChangeFolderName}
            />
        </Modal>
    );
};

export default FolderCreation;
