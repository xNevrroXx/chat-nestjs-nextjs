import React, { FC, Fragment } from "react";
import { ConfigProvider } from "antd";
import MainMenu from "@/modules/MainMenu/MainMenu";
import SubMenu from "@/modules/SubMenu/SubMenu";
import Dialogs from "@/modules/Dialogs/Dialogs";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import { useWindowDimensions } from "@/hooks/useWindowDimensions.hook";
import { IUserDto } from "@/models/auth/IAuth.store";
import {
    TPreviewRoomWithFlag,
    TRoomWithPreviewFlag,
} from "@/models/room/IRoom.store";
import darkTheme from "@/theme/dark.theme";
import PlugRoom from "@/components/PlugRoom/PlugRoom";

interface IProps {
    user: IUserDto;
    activeRoom: TRoomWithPreviewFlag | TPreviewRoomWithFlag | null;
    isDrawerOpen: boolean;
    onOpenSubmenu: () => void;
    onCloseSubmenu: () => void;
    windowDimensions: ReturnType<typeof useWindowDimensions>;
}

const MainPageUi: FC<IProps> = ({
    user,
    windowDimensions,
    onOpenSubmenu,
    isDrawerOpen,
    activeRoom,
    onCloseSubmenu,
}) => {
    if (windowDimensions.width >= 768) {
        return (
            <Fragment>
                <MainMenu onOpenSubmenu={onOpenSubmenu} />
                <SubMenu isOpen={isDrawerOpen} onClose={onCloseSubmenu} />
                <Dialogs user={user} />
                <ConfigProvider
                    theme={{
                        ...darkTheme,
                        token: {
                            colorBgLayout: "#0e1621",
                        },
                    }}
                >
                    {activeRoom ? (
                        <ActiveRoom room={activeRoom} user={user} />
                    ) : (
                        <PlugRoom />
                    )}
                </ConfigProvider>
            </Fragment>
        );
    }

    // the tablet or phone devices below
    if (activeRoom) {
        return (
            <ConfigProvider
                theme={{
                    ...darkTheme,
                    token: {
                        colorBgLayout: "#0e1621",
                    },
                }}
            >
                <ActiveRoom room={activeRoom} user={user} />
            </ConfigProvider>
        );
    }

    return (
        <Fragment>
            <MainMenu onOpenSubmenu={onOpenSubmenu} />
            <SubMenu isOpen={isDrawerOpen} onClose={onCloseSubmenu} />
            <Dialogs user={user} />
        </Fragment>
    );
};

export default MainPageUi;
