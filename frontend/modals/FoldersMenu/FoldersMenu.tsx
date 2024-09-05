import { useCallback, useMemo } from "react";
import { Flex, Modal, Typography, theme, Button, Tooltip, Divider } from "antd";
import {
    FolderFilled,
    DeleteOutlined,
    PlusCircleFilled,
} from "@ant-design/icons";
import { TRemoveFolder } from "@/models/rooms-on-folders/IRoomOnFolders.store";
import { FlexButton } from "@/components/Button/FlexButton";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { modalInfoSelector } from "@/store/selectors/modalInfo.selector";
import { closeModals, openModal } from "@/store/actions/modal-windows";
import { foldersSelector } from "@/store/selectors/folders.selector";
import { removeFolder } from "@/store/thunks/roomsOnFolders";

const { useToken } = theme;
const { Text } = Typography;

const FoldersMenu = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector((state) =>
        modalInfoSelector(state, "foldersMenu"),
    );
    const folders = useAppSelector(foldersSelector);
    const { token } = useToken();

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOpenCreateFolderModal = useCallback(() => {
        dispatch(
            openModal({ modalName: "folderCreation", closeOthers: false }),
        );
    }, [dispatch]);

    const onRemoveFolder = useCallback(
        (data: TRemoveFolder) => {
            void dispatch(removeFolder(data));
        },
        [dispatch],
    );

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
            open={modalInfo.isOpen}
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

export default FoldersMenu;
