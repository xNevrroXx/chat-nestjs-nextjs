"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ConfigProvider, Layout, Modal } from "antd";
import { useRouter } from "next/navigation";
// own modules
import { ROUTES } from "@/router/routes";
import { createRoute } from "@/router/createRoute";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import ListRooms from "@/modules/ListRooms/ListRooms";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import Dialogs from "@/modules/Dialogs/Dialogs";
import MainMenu from "@/modules/MainMenu/MainMenu";
import SubMenu from "@/modules/SubMenu/SubMenu";
import CreateGroupModal from "@/modules/CreateGroupModal/CreateGroupModal";
import darkTheme from "@/theme/dark.theme";
// selectors & actions
import {
    createRoom,
    forwardMessageSocket,
    joinRoom,
} from "@/store/thunks/room";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import {
    addRecentRoomData,
    removeRecentRoomData,
} from "@/store/actions/recentRooms";
// own types
import type {
    IForwardMessage,
    IRoom,
    TCreateGroupRoom,
    TPreviewExistingRoom,
} from "@/models/room/IRoom.store";
import type { TValueOf } from "@/models/TUtils";
import { checkIsPreviewExistingRoomWithFlag } from "@/models/room/IRoom.store";
// styles
import "./main.scss";

const { Content } = Layout;

const Main = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const user = useAppSelector((state) => state.authentication.user!);
    const rooms = useAppSelector((state) => state.room.local);
    const activeRoom = useAppSelector(activeRoomSelector);
    const [isOpenModalToForwardMessage, setIsOpenModalToForwardMessage] =
        useState<boolean>(false);
    const [isOpenModalToCreateGroup, setIsOpenModalToCreateGroup] =
        useState<boolean>(false);
    const [forwardedMessageId, setForwardedMessageId] = useState<TValueOf<
        Pick<IForwardMessage, "forwardedMessageId">
    > | null>(null);

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

    const openModalToCreateGroup = useCallback(() => {
        setIsOpenModalToCreateGroup(true);
    }, []);

    const closeModalToCreateGroup = useCallback(() => {
        setIsOpenModalToCreateGroup(false);
    }, []);

    const onChangeActiveDialog = useCallback(
        (roomId: TValueOf<Pick<IRoom, "id">>) => {
            const targetRoom = rooms.rooms.byId[roomId];

            if (activeRoom && targetRoom.id === activeRoom.id) {
                return;
            }

            dispatch(
                addRecentRoomData({
                    id: targetRoom.id,
                }),
            );
        },
        [rooms, activeRoom, dispatch],
    );

    const onClickRemoteRoom = useCallback(
        (remoteRoom: TPreviewExistingRoom) => {
            dispatch(
                addRecentRoomData({
                    id: remoteRoom.id,
                    isPreview: true,
                }),
            );
        },
        [dispatch],
    );

    const onClickRoomToForwardMessage = (room: IRoom) => {
        setIsOpenModalToForwardMessage(false);
        if (!forwardedMessageId) {
            return;
        }

        void dispatch(
            forwardMessageSocket({
                roomId: room.id,
                forwardedMessageId: forwardedMessageId,
            }),
        );
    };
    const openModalToForwardMessage = useCallback(
        (
            forwardedMessageId: TValueOf<
                Pick<IForwardMessage, "forwardedMessageId">
            >,
        ) => {
            setForwardedMessageId(forwardedMessageId);
            setIsOpenModalToForwardMessage(true);
        },
        [],
    );

    const onCloseForwardModal = useCallback(() => {
        setIsOpenModalToForwardMessage(false);
    }, []);

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

    const onCreateRoom = useCallback(
        async (remoteRoom: TCreateGroupRoom) => {
            try {
                const newRoom = await dispatch(createRoom(remoteRoom)).unwrap();

                dispatch(
                    addRecentRoomData({
                        id: newRoom.id,
                    }),
                );
                return newRoom;
            }
            catch (rejectedValueOrSerializedError) {
                console.warn(
                    "Error when creating a room!: ",
                    rejectedValueOrSerializedError,
                );
            }
        },
        [dispatch],
    );

    return (
        <Content className="messenger">
            <MainMenu onOpenSubmenu={onOpenSubmenu} />
            <SubMenu
                isOpen={isDrawerOpen}
                onClose={onCloseSubmenu}
                openModalToCreateGroup={openModalToCreateGroup}
            />
            <ConfigProvider
                theme={{
                    ...darkTheme,
                    components: {
                        Layout: {
                            headerBg: "#17212b",
                        },
                    },
                }}
            >
                <Dialogs
                    user={user}
                    onClickRoom={onChangeActiveDialog}
                    onClickRemoteRoom={onClickRemoteRoom}
                    activeRoomId={activeRoom ? activeRoom.id : null}
                />
                <ActiveRoom
                    room={activeRoom}
                    user={user}
                    onJoinRoom={onJoinRoom}
                    openModalToForwardMessage={openModalToForwardMessage}
                />
                <Modal
                    title="Переслать сообщение"
                    open={isOpenModalToForwardMessage}
                    onCancel={onCloseForwardModal}
                    okButtonProps={{ style: { display: "none" } }}
                    cancelButtonProps={{ style: { display: "none" } }}
                >
                    <ListRooms
                        rooms={Object.values(rooms.rooms.byId)}
                        onClickRoom={onClickRoomToForwardMessage}
                    />
                </Modal>
                <CreateGroupModal
                    onOk={(roomInfo: TCreateGroupRoom) =>
                        onCreateRoom(roomInfo)
                    }
                    onCloseModal={closeModalToCreateGroup}
                    isOpen={isOpenModalToCreateGroup}
                />
            </ConfigProvider>
        </Content>
    );
};

export default Main;
