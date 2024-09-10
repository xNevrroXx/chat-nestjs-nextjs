import React, { FC, useCallback } from "react";
import {
    Avatar,
    Button,
    ConfigProvider,
    Divider,
    Flex,
    Typography,
} from "antd";
import {
    CloseOutlined,
    DeleteOutlined,
    PlusCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { Header } from "antd/lib/layout/layout";
import { Drawer } from "antd/lib";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { FlexButton } from "@/components/Button/FlexButton";
import { getNameInitials } from "@/utils/getNameInitials";
import { openModal } from "@/store/actions/modal-windows";

const { Text } = Typography;

interface ISubMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubMenu: FC<ISubMenuProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.authentication.user);

    const openModalToLogout = useCallback(() => {
        dispatch(openModal({ modalName: "logout" }));
    }, [dispatch]);

    const openModalToCreateGroup = useCallback(() => {
        dispatch(openModal({ modalName: "groupCreationMenu" }));
    }, [dispatch]);

    const openModalToDeleteAccount = useCallback(() => {
        dispatch(openModal({ modalName: "accountDeletion" }));
    }, [dispatch]);

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
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "5px",
                        height: "max-content",
                    }}
                >
                    <Flex vertical gap={5} style={{ height: "max-content" }}>
                        <Avatar
                            size={50}
                            style={{
                                backgroundColor: user.color,
                                fontWeight: 600,
                            }}
                        >
                            {getNameInitials({
                                name: user.displayName,
                            })}
                        </Avatar>
                        <Text style={{ wordBreak: "normal" }}>
                            {user.displayName}
                        </Text>
                    </Flex>
                    <Button
                        type={"text"}
                        icon={<CloseOutlined />}
                        onClick={onClose}
                    />
                </Header>
                <Divider style={{ margin: "15px 0" }} />
                <Flex vertical gap="small" style={{ height: "fill-available" }}>
                    <FlexButton
                        style={{
                            padding: "0 25px",
                        }}
                        icon={<DeleteOutlined style={{ fontSize: "20px" }} />}
                        onClick={openModalToDeleteAccount}
                    >
                        Удалить аккаунт
                    </FlexButton>
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
                    <FlexButton
                        style={{
                            padding: "0 25px",
                        }}
                        icon={
                            <CloseCircleOutlined style={{ fontSize: "20px" }} />
                        }
                        onClick={openModalToLogout}
                    >
                        Выйти
                    </FlexButton>
                </Flex>
            </Drawer>
        </ConfigProvider>
    );
};

export default SubMenu;
