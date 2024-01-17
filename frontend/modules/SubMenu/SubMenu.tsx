import React, { FC } from "react";
import {
    Avatar,
    Button,
    ConfigProvider,
    Divider,
    Flex,
    Typography,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Header } from "antd/lib/layout/layout";
import { ButtonProps, Drawer } from "antd/lib";
import { useAppSelector } from "@/hooks/store.hook";
import { FlexButton } from "@/components/Button/FlexButton";

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
    isOpen: boolean;
    onClose: () => void;
    openModalToCreateGroup: () => void;
}

const SubMenu: FC<ISubMenuProps> = ({
    isOpen,
    onClose,
    openModalToCreateGroup,
}) => {
    const user = useAppSelector((state) => state.authentication.user);

    if (!user) {
        return;
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    fontSize: 16,
                    fontWeightStrong: 700,
                },
            }}
        >
            <Drawer
                open={isOpen}
                closable={false}
                placement={"left"}
                onClose={onClose}
                styles={{
                    body: {
                        padding: 0,
                    },
                }}
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
                    <Avatar size={40} />
                    <Text style={{ wordBreak: "normal" }}>
                        {user.displayName}
                    </Text>
                </Header>
                <Divider style={{ margin: "15px 0" }} />
                <Flex vertical gap="small">
                    <FlexButton
                        style={{
                            padding: "0 25px",
                        }}
                        icon={
                            <PlusCircleOutlined style={{ fontSize: "20px" }} />
                        }
                        onClick={openModalToCreateGroup}
                    >
                        Новая группа
                    </FlexButton>
                    <CustomButton
                        style={{
                            padding: "0 25px",
                        }}
                    >
                        Ночной режим
                    </CustomButton>
                </Flex>
            </Drawer>
        </ConfigProvider>
    );
};

export default SubMenu;
