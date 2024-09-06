import React, { FC, Fragment } from "react";
import MainMenu from "@/modules/MainMenu/MainMenu";
import SubMenu from "@/modules/SubMenu/SubMenu";
import Dialogs from "@/modules/Dialogs/Dialogs";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import { useWindowDimensions } from "@/hooks/useWindowDimensions.hook";
import { IUserDto } from "@/models/auth/IAuth.store";
import {
    IRoom,
    TPreviewExistingRoom,
    TPreviewExistingRoomWithFlag,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";

interface IProps {
    windowDimensions: ReturnType<typeof useWindowDimensions>;
    user: IUserDto;
    onOpenSubmenu: () => void;
    isDrawerOpen: boolean;
    onChangeActiveDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void;
    onClickRemoteRoom: (remoteRoom: TPreviewExistingRoom) => void;
    activeRoom: IRoom | TPreviewExistingRoomWithFlag | null;
    closeCurrentRoom: () => void;
    onJoinRoom: () => Promise<IRoom | undefined>;
    onCloseSubmenu: () => void;
}

const MainPageUi: FC<IProps> = ({
    user,
    windowDimensions,
    onOpenSubmenu,
    isDrawerOpen,
    onChangeActiveDialog,
    onClickRemoteRoom,
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
                <Dialogs
                    user={user}
                    onClickRoom={onChangeActiveDialog}
                    onClickRemoteRoom={onClickRemoteRoom}
                    activeRoomId={activeRoom ? activeRoom.id : null}
                />
                <ActiveRoom
                    onCloseRoom={closeCurrentRoom}
                    room={activeRoom}
                    user={user}
                    onJoinRoom={onJoinRoom}
                />
            </Fragment>
        );
    }

    // the tablet or phone devices below
    if (activeRoom) {
        return (
            <ActiveRoom
                onCloseRoom={closeCurrentRoom}
                room={activeRoom}
                user={user}
                onJoinRoom={onJoinRoom}
            />
        );
    }

    return (
        <Fragment>
            <MainMenu onOpenSubmenu={onOpenSubmenu} />
            <SubMenu isOpen={isDrawerOpen} onClose={onCloseSubmenu} />
            <Dialogs
                user={user}
                onClickRoom={onChangeActiveDialog}
                onClickRemoteRoom={onClickRemoteRoom}
                activeRoomId={null}
            />
        </Fragment>
    );
};

export default MainPageUi;
