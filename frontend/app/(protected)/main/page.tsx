"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Layout, Modal } from "antd";
import { useRouter } from "next/navigation";
// own modules
import { ROUTES } from "@/router/routes";
import { createRoute } from "@/router/createRoute";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import ListRooms from "@/modules/ListRooms/ListRooms";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import Dialogs from "@/modules/Dialogs/Dialogs";
import CreateGroupModal from "@/modules/CreateGroupModal/CreateGroupModal";
// selectors & actions
import {
    createRoom,
    forwardMessageSocket,
    joinRoom,
} from "@/store/thunks/room";
// own types
import type {
    IForwardMessage,
    IRoom,
    TPreviewExistingRoom,
} from "@/models/room/IRoom.store";
import type { TValueOf } from "@/models/TUtils";
import type { TCreateGroupRoom } from "@/models/room/IRoom.store";
// styles
import "./main.scss";
import { activeRoomSelector } from "@/store/selectors/activeRoomSelector";
import {
    addRecentRoomData,
    removeRecentRoomData,
} from "@/store/actions/recentRooms";
import { checkIsPreviewExistingRoomWithFlag } from "@/models/room/IRoom.store";

const { Content } = Layout;

const Main = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
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

    const openModalToCreateGroup = useCallback(() => {
        setIsOpenModalToCreateGroup(true);
    }, []);

    const closeModalToCreateGroup = useCallback(() => {
        setIsOpenModalToCreateGroup(false);
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

    return (
        <Fragment>
            <Content className="messenger">
                <Dialogs
                    user={user}
                    onClickRoom={onChangeActiveDialog}
                    onClickRemoteRoom={onClickRemoteRoom}
                    activeRoomId={activeRoom ? activeRoom.id : null}
                    openModalToCreateGroup={openModalToCreateGroup}
                />
                <ActiveRoom
                    room={activeRoom}
                    user={user}
                    onJoinRoom={onJoinRoom}
                    openModalToForwardMessage={openModalToForwardMessage}
                />
            </Content>
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
                onOk={(roomInfo: TCreateGroupRoom) => onCreateRoom(roomInfo)}
                onCloseModal={closeModalToCreateGroup}
                isOpen={isOpenModalToCreateGroup}
            />
        </Fragment>
    );
};

export default Main;
