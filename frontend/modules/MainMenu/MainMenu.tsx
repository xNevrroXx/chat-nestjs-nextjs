import React, { FC, useCallback, useMemo, useState } from "react";
import { Button, Layout, Typography, ConfigProvider, Flex } from "antd";
import { useAppDispatch } from "@/hooks/store.hook";
import {
    MenuOutlined,
    FolderOutlined,
    WechatOutlined,
} from "@ant-design/icons";
import darkTheme from "@/theme/dark.theme";
import { ButtonProps } from "antd/lib";

const { Sider } = Layout;
const { Text } = Typography;

interface IMenuProps {
    onOpenSubmenu: () => void;
}

const MOCK_FOLDERS: { id: string; name: string }[] = [
    {
        id: "1a",
        name: "Programming",
    },
    {
        id: "2a",
        name: "Education",
    },
];

const FlexButton: FC<
    Omit<ButtonProps, "children"> & {
        icon: React.ReactNode;
        text?: string;
        isActive?: boolean;
    }
> = ({ icon, text, isActive, ...props }) => {
    return (
        <Button
            type={"text"}
            block
            {...props}
            style={{
                height: "64px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "4px 5px",
                color: isActive ? "#5eb5f7" : undefined,
                whiteSpace: "normal",
            }}
        >
            {icon}
            {text && (
                <Text
                    style={{
                        textAlign: "center",
                        margin: 0,
                        fontSize: "12px",
                        color: isActive ? "#5eb5f7" : undefined,
                    }}
                >
                    {text}
                </Text>
            )}
        </Button>
    );
};

const MainMenu: FC<IMenuProps> = ({ onOpenSubmenu }) => {
    const dispatch = useAppDispatch();
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const folders = MOCK_FOLDERS;

    const onChangeFolder = useCallback((folderId?: string) => {
        setCurrentFolder(folderId ?? null);
    }, []);

    const folderItems = useMemo(() => {
        return folders.map(({ id, name }) => {
            return (
                <FlexButton
                    isActive={currentFolder === id}
                    key={id}
                    icon={<FolderOutlined style={{ fontSize: "24px" }} />}
                    text={name}
                    onClick={() => onChangeFolder(id)}
                />
            );
        });
    }, [currentFolder, folders, onChangeFolder]);

    return (
        <ConfigProvider theme={darkTheme}>
            <Sider width="min-content">
                <Flex vertical align="flex-start" style={{ width: "70px" }}>
                    <FlexButton
                        onClick={onOpenSubmenu}
                        icon={<MenuOutlined style={{ fontSize: "24px" }} />}
                    />

                    <FlexButton
                        isActive={!currentFolder}
                        icon={<WechatOutlined style={{ fontSize: "24px" }} />}
                        text={"Все чаты"}
                        onClick={() => onChangeFolder()}
                    />
                    {folderItems}
                </Flex>
            </Sider>
        </ConfigProvider>
    );
};

export default MainMenu;
