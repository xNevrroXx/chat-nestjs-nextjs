import React, { FC, useRef } from "react";
import Sider from "antd/lib/layout/Sider";
import darkTheme from "@/theme/dark.theme";
import {
    Avatar,
    Button,
    ConfigProvider,
    Divider,
    Flex,
    Layout,
    Typography,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Header } from "antd/lib/layout/layout";
import { ButtonProps } from "antd/lib";
import { useAppSelector } from "@/hooks/store.hook";

const { Text } = Typography;

const CustomButton: FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <Button
            type={"text"}
            block
            {...props}
            style={{
                display: "flex",
                alignItems: "center",
                textAlign: "left",
                minWidth: "min-content",
                wordBreak: "normal",
                ...props.style,
            }}
        >
            {children}
        </Button>
    );
};

interface ISubMenuProps {
    isCollapsed: boolean;
    closeSubMenu: () => void;
    openModalToCreateGroup: () => void;
}

const SubMenu: FC<ISubMenuProps> = ({
    isCollapsed,
    closeSubMenu,
    openModalToCreateGroup,
}) => {
    const inactiveBgRef = useRef<HTMLDivElement | null>(null);
    const user = useAppSelector((state) => state.authentication.user);

    if (!user) {
        return;
    }

    return (
        <ConfigProvider
            theme={{
                ...darkTheme,
                token: {
                    fontSize: 16,
                    fontWeightStrong: 700,
                },
            }}
        >
            <Layout
                ref={inactiveBgRef}
                onClick={(event) => {
                    if (event.target !== inactiveBgRef.current) {
                        return;
                    }

                    closeSubMenu();
                }}
                style={{
                    display: isCollapsed ? "none" : "flex",
                    zIndex: 100,
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,.4)",
                    position: "absolute",
                }}
            >
                <Sider
                    collapsedWidth={0}
                    collapsed={isCollapsed}
                    width="20%"
                    style={{ overflow: "hidden" }}
                >
                    <Header
                        style={{
                            padding: "10px 25px 0 25px",
                            height: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >
                        <Avatar />
                        <Text style={{ wordBreak: "normal" }}>
                            {user.displayName}
                        </Text>
                    </Header>
                    <Divider />
                    <Flex vertical gap="small">
                        <CustomButton
                            style={{
                                padding: "0 25px",
                            }}
                            icon={
                                <PlusCircleOutlined
                                    style={{ fontSize: "20px" }}
                                />
                            }
                            onClick={openModalToCreateGroup}
                        >
                            Новая группа
                        </CustomButton>
                        <CustomButton
                            style={{
                                padding: "0 25px",
                            }}
                        >
                            Ночной режим
                        </CustomButton>
                    </Flex>
                </Sider>
            </Layout>
        </ConfigProvider>
    );
};

export default SubMenu;
