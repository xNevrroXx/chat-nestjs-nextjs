import React, { FC, useCallback, useMemo } from "react";
import { Flex, Modal, Typography, theme, Button, Tooltip, Divider } from "antd";
import {
    FolderFilled,
    DeleteOutlined,
    PlusCircleFilled,
} from "@ant-design/icons";
import {
    IFolder,
    TRemoveFolder,
} from "@/models/rooms-on-folders/IRoomOnFolders.store";
import { FlexButton } from "@/components/Button/FlexButton";

const { useToken } = theme;
const { Text } = Typography;

interface IFoldersModalProps {
    isOpen: boolean;
    onClose: () => void;
    folders: IFolder[];
    onRemoveFolder: (data: TRemoveFolder) => void;
    onOpenCreateFolderModal: () => void;
}

const FoldersModal: FC<IFoldersModalProps> = ({
    isOpen,
    onClose,
    folders,
    onRemoveFolder,
    onOpenCreateFolderModal,
}) => {
    const { token } = useToken();

    const folderItemsWithActions = useMemo(() => {
        return folders.map((folder) => {
            return (
                <Flex key={folder.id} gap={"large"} align={"center"}>
                    <FolderFilled style={{ fontSize: 20 }} />
                    <Flex vertical style={{ flexGrow: 1 }}>
                        <Text editable={{ tooltip: "Переименовать" }}>
                            {/*todo send HTTP request on edit folder name*/}
                            {folder.name}
                        </Text>
                        <Text>{folder.roomIds.length} шт.</Text>
                    </Flex>
                    <Tooltip placement={"top"} title={"Удалить"}>
                        <Button
                            type={"text"}
                            icon={
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: token.colorTextSecondary,
                                    }}
                                />
                            }
                            onClick={() =>
                                onRemoveFolder({
                                    folderId: folder.id,
                                })
                            }
                        />
                    </Tooltip>
                </Flex>
            );
        });
    }, [folders, onRemoveFolder, token.colorTextSecondary]);

    return (
        <Modal
            title={"Папки"}
            open={isOpen}
            onCancel={onClose}
            okButtonProps={{ style: { display: "none" } }}
            cancelButtonProps={{ style: { display: "none" } }}
            width={"375px"}
        >
            <Flex vertical justify={"center"} gap={"middle"}>
                <Text
                    type={"secondary"}
                    style={{
                        textAlign: "center",
                    }}
                >
                    Вы можете создать папки с нужными
                    <br />
                    чатами и переключаться между ними.
                </Text>
                <Divider style={{ margin: "3px 0" }} />
                {folderItemsWithActions}
                <FlexButton
                    icon={
                        <PlusCircleFilled
                            style={{
                                fontSize: 20,
                            }}
                        />
                    }
                    style={{ justifyContent: "center" }}
                    onClick={onOpenCreateFolderModal}
                >
                    Создать новую папку
                </FlexButton>
            </Flex>
        </Modal>
    );
};

export default FoldersModal;
