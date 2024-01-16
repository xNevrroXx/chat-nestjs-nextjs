import React, { ChangeEvent, FC, useCallback, useState } from "react";
import { Input, Modal } from "antd";
import { TCreateFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";

interface ICreateFolderModalProps {
    isOpen: boolean;
    onCreateFolder: (data: TCreateFolder) => void;
    onCancel: () => void;
}

const CreateFolderModal: FC<ICreateFolderModalProps> = ({
    onCreateFolder,
    onCancel,
    isOpen,
}) => {
    const [folderName, setFolderName] = useState<string>("");

    const onOk = useCallback(() => {
        onCreateFolder({
            name: folderName,
        });
    }, [folderName, onCreateFolder]);

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

    return (
        <Modal
            title={"Новая папка"}
            onOk={onOk}
            onCancel={onCancel}
            open={isOpen}
            width={"350px"}
        >
            <Input
                placeholder={"Название папки"}
                onChange={onChangeFolderName}
            />
        </Modal>
    );
};

export default CreateFolderModal;
