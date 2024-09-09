"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { useRouter } from "next/navigation";
// own modules
import { ROUTES } from "@/router/routes";
import { createRoute } from "@/router/createRoute";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import darkTheme from "@/theme/dark.theme";
import { useWindowDimensions } from "@/hooks/useWindowDimensions.hook";
// selectors & actions
import { joinRoom } from "@/store/thunks/room";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import {
    addRecentRoomData,
    removeRecentRoomData,
    resetCurrentRoomId,
} from "@/store/actions/recent-rooms";
// own types
import { checkIsPreviewExistingRoomWithFlag } from "@/models/room/IRoom.store";
import { updateScreenInfo } from "@/store/slices/device";
import MainPageUI from "@/modules/MainPageUI/MainPageUI";
import ModalWindows from "@/modules/ModalWindows/ModalWindows";
import type { TValueOf } from "@/models/TUtils";
import type { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
// styles
import "./main.scss";

const { Content } = Layout;

const Main = () => {
    const windowDimensions = useWindowDimensions();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const user = useAppSelector((state) => state.authentication.user!);
    const rooms = useAppSelector((state) => state.room.local);
    const activeRoom = useAppSelector(activeRoomSelector);

    useEffect(() => {
        dispatch(updateScreenInfo(windowDimensions));
    }, [dispatch, windowDimensions]);

    useEffect(() => {
        if (!user) {
            void router.push(createRoute({ path: ROUTES.AUTH }));
        }
    }, [router, user]);

    const onOpenSubmenu = useCallback(() => {
        setIsDrawerOpen(true);
    }, []);

    const onCloseSubmenu = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const closeCurrentRoom = useCallback(() => {
        dispatch(resetCurrentRoomId());
    }, [dispatch]);

    const onJoinRoom = useCallback(async () => {
        // activeRoom, probably, is a remote room viewing at this moment.
        if (!activeRoom || !checkIsPreviewExistingRoomWithFlag(activeRoom)) {
            return;
        }

        try {
            dispatch(removeRecentRoomData(activeRoom.id));
            const newRoom = await dispatch(joinRoom(activeRoom)).unwrap();

            dispatch(
                addRecentRoomData({
                    id: newRoom.id,
                }),
            );
            return newRoom;
        }
        catch (rejectedValueOrSerializedError) {
            console.warn(
                "Error when joining a room!: ",
                rejectedValueOrSerializedError,
            );
        }
    }, [activeRoom, dispatch]);

    if (!user) {
        return;
    }

    return (
        <ConfigProvider
            theme={{
                ...darkTheme,
                components: {
                    Layout: {
                        siderBg: "#0e1621",
                        headerBg: "#17212b",
                    },
                },
            }}
        >
            <Content className="messenger">
                <MainPageUI
                    windowDimensions={windowDimensions}
                    user={user}
                    onOpenSubmenu={onOpenSubmenu}
                    isDrawerOpen={isDrawerOpen}
                    activeRoom={activeRoom}
                    closeCurrentRoom={closeCurrentRoom}
                    onJoinRoom={onJoinRoom}
                    onCloseSubmenu={onCloseSubmenu}
                />
                {/*todo: add calling room id to the recent rooms info to achieve an calling during chatting with other users*/}

                <ModalWindows />
            </Content>
        </ConfigProvider>
    );
};
export default Main;
