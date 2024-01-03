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
import { createRoom, forwardMessageSocket } from "@/store/thunks/room";
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
import { addRecentRoomData } from "@/store/actions/recentRooms";

const { Content } = Layout;

const Main = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.authentication.user!);
    const rooms = useAppSelector((state) => state.room.rooms);
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

    const onChangeDialog = useCallback(
        (roomId: TValueOf<Pick<IRoom, "id">>) => {
            const targetRoom = rooms.find((room) => room.id === roomId)!;

            console.log("activeRoom: ", activeRoom);
            console.log("targetRoom: ", targetRoom);
            if (activeRoom && targetRoom.id === activeRoom.id) {
                console.log(true);
                return;
            }

            dispatch(
                addRecentRoomData({
                    id: targetRoom.id,
                    input: {
                        isAudioRecord: false,
                        files: [],
                        text: "",
                    },
                }),
            );
        },
        [activeRoom, dispatch, rooms],
    );

    const onJoinRoom = useCallback((remoteRoom: TPreviewExistingRoom) => {
        try {
            // const actionResult = await dispatch(joinRoom(remoteRoom));
            // if (actionResult.meta.requestStatus === "rejected") {
            //     throw new Error();
            // }
            // const newRoom = actionResult.payload as IRoom;

            // setActiveRoom(remoteRoom);
            console.log("join");
        } catch (error) {
            return;
        }
    }, []);

    const onCreateRoom = useCallback(
        async (remoteRoom: TCreateGroupRoom) => {
            try {
                const actionResult = await dispatch(createRoom(remoteRoom));
                if (actionResult.meta.requestStatus === "rejected") {
                    throw new Error();
                }
                // const newRoom = actionResult.payload as IRoom;
                // setActiveRoom(newRoom);
                console.log("create");
            } catch (error) {
                return;
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

    return (
        <Fragment>
            <Content className="messenger">
                <Dialogs
                    user={user}
                    rooms={rooms}
                    onChangeRoom={onChangeDialog}
                    onJoinRoom={onJoinRoom}
                    activeRoomId={activeRoom ? activeRoom.id : null}
                    openModalToCreateGroup={openModalToCreateGroup}
                />
                <ActiveRoom
                    room={activeRoom}
                    user={user}
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
                    rooms={rooms}
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
