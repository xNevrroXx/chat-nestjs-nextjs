import React, { FC, Fragment } from "react";
import { ConfigProvider } from "antd";
import MainMenu from "@/modules/MainMenu/MainMenu";
import SubMenu from "@/modules/SubMenu/SubMenu";
import Dialogs from "@/modules/Dialogs/Dialogs";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import { useWindowDimensions } from "@/hooks/useWindowDimensions.hook";
import { IUserDto } from "@/models/auth/IAuth.store";
import {
    IRoom,
    TPreviewExistingRoomWithFlag,
    TRoomWithPreviewFlag,
} from "@/models/room/IRoom.store";
import darkTheme from "@/theme/dark.theme";

interface IProps {
    windowDimensions: ReturnType<typeof useWindowDimensions>;
    user: IUserDto;
    onOpenSubmenu: () => void;
    isDrawerOpen: boolean;
    activeRoom: TRoomWithPreviewFlag | TPreviewExistingRoomWithFlag | null;
    closeCurrentRoom: () => void;
    onJoinRoom: () => Promise<IRoom | undefined>;
    onCloseSubmenu: () => void;
}

const MainPageUi: FC<IProps> = ({
    user,
    windowDimensions,
    onOpenSubmenu,
    isDrawerOpen,
    activeRoom,
    closeCurrentRoom,
    onJoinRoom,
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
                    <ActiveRoom
                        onCloseRoom={closeCurrentRoom}
                        room={activeRoom}
                        user={user}
                        onJoinRoom={onJoinRoom}
                    />
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
                <ActiveRoom
                    onCloseRoom={closeCurrentRoom}
                    room={activeRoom}
                    user={user}
                    onJoinRoom={onJoinRoom}
                />
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
