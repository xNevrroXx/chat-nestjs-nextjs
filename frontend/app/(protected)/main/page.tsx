"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { useRouter } from "next/navigation";
// own modules
import darkTheme from "@/theme/dark.theme";
import { ROUTES } from "@/router/routes";
import { createRoute } from "@/router/createRoute";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { useWindowDimensions } from "@/hooks/useWindowDimensions.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
// own types
import { updateScreenInfo } from "@/store/slices/device";
import MainPageUI from "@/modules/MainPageUI/MainPageUI";
import ModalWindows from "@/modules/ModalWindows/ModalWindows";
// styles
import "./main.scss";

const { Content } = Layout;

const Main = () => {
    const windowDimensions = useWindowDimensions();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const user = useAppSelector((state) => state.authentication.user!);
    const activeRoom = useAppSelector(activeRoomSelector);

    useEffect(() => {
        dispatch(updateScreenInfo(windowDimensions));
    }, [dispatch, windowDimensions]);

    useEffect(() => {
        if (user) {
            return;
        }

        void router.push(createRoute({ path: ROUTES.AUTH }));
    }, [router, user]);

    const onOpenSubmenu = useCallback(() => {
        setIsDrawerOpen(true);
    }, []);

    const onCloseSubmenu = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

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
                    onCloseSubmenu={onCloseSubmenu}
                />
                {/*todo: add calling room id to the recent rooms info to achieve an calling during chatting with other users*/}

                <ModalWindows />
            </Content>
        </ConfigProvider>
    );
};
export default Main;
