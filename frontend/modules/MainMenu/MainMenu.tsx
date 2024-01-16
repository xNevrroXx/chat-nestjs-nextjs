import React, { FC, useCallback, useMemo, useState } from "react";
import { Layout, Flex } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import {
    MenuOutlined,
    FolderOutlined,
    WechatOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { changeCurrentFolder } from "@/store/actions/roomsOnFolders";
import FoldersModal from "@/components/FoldersModal/FoldersModal";
import { VerticalFlexButton } from "@/components/Button/VerticalFlexButton";
import { foldersSelector } from "@/store/selectors/folders.selector";
import CreateFolderModal from "@/components/CreateFolderModal/CreateFolderModal";
import { createFolder, removeFolder } from "@/store/thunks/roomsOnFolders";
import {
    TCreateFolder,
    TRemoveFolder,
} from "@/models/rooms-on-folders/IRoomOnFolders.store";

const { Sider } = Layout;

interface IMenuProps {
    onOpenSubmenu: () => void;
}

const MainMenu: FC<IMenuProps> = ({ onOpenSubmenu }) => {
    const dispatch = useAppDispatch();
    const currentFolder = useAppSelector((state) => state.folders.current);
    const folders = useAppSelector(foldersSelector);
    const [isOpenFoldersModal, setIsOpenFoldersModal] =
        useState<boolean>(false);
    const [isOpenCreateFolderModal, setIsOpenCreateFolderModal] =
        useState<boolean>(false);

    const onChangeFolder = useCallback(
        (folderId?: string) => {
            dispatch(changeCurrentFolder(folderId ?? null));
        },
        [dispatch],
    );

    const onCreateFolder = useCallback(
        (data: TCreateFolder) => {
            void dispatch(createFolder(data));
        },
        [dispatch],
    );

    const onRemoveFolder = useCallback(
        (data: TRemoveFolder) => {
            void dispatch(removeFolder(data));
        },
        [dispatch],
    );

    const folderItems = useMemo(() => {
        return folders.map(({ id, name }) => {
            return (
                <VerticalFlexButton
                    isActive={currentFolder === id}
                    key={id}
                    icon={<FolderOutlined style={{ fontSize: "24px" }} />}
                    text={name}
                    onClick={() => onChangeFolder(id)}
                />
            );
        });
    }, [currentFolder, folders, onChangeFolder]);

    const onOpenFoldersModal = useCallback(() => {
        setIsOpenFoldersModal(true);
    }, []);

    const onCloseFoldersModal = useCallback(() => {
        setIsOpenFoldersModal(false);
    }, []);

    const onOpenCreateFolderModal = useCallback(() => {
        setIsOpenCreateFolderModal(true);
    }, []);

    const onCloseCreateFolderModal = useCallback(() => {
        setIsOpenCreateFolderModal(false);
    }, []);

    return (
        <Sider width="min-content">
            <Flex vertical align="flex-start" style={{ width: "70px" }}>
                <VerticalFlexButton
                    onClick={onOpenSubmenu}
                    icon={<MenuOutlined style={{ fontSize: "24px" }} />}
                />

                <VerticalFlexButton
                    isActive={!currentFolder}
                    icon={<WechatOutlined style={{ fontSize: "24px" }} />}
                    text={"Все чаты"}
                    onClick={() => onChangeFolder()}
                />
                {folderItems}
                <VerticalFlexButton
                    icon={<EditOutlined />}
                    text={"Редакт."}
                    onClick={onOpenFoldersModal}
                />
            </Flex>
            <FoldersModal
                folders={folders}
                isOpen={isOpenFoldersModal}
                onClose={onCloseFoldersModal}
                onRemoveFolder={onRemoveFolder}
                onOpenCreateFolderModal={onOpenCreateFolderModal}
            />
            <CreateFolderModal
                isOpen={isOpenCreateFolderModal}
                onCreateFolder={onCreateFolder}
                onCancel={onCloseCreateFolderModal}
            />
        </Sider>
    );
};

export default MainMenu;
