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

    const onChangeFolder = useCallback(
        (folderId?: string) => {
            dispatch(changeCurrentFolder(folderId ?? null));
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
            />
        </Sider>
    );
};

export default MainMenu;
