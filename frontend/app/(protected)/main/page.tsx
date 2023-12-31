"use client";

import {Fragment, useCallback, useEffect, useState} from "react";
import {Layout, Modal} from "antd";
// own modules
import {useAppDispatch, useAppSelector} from "@/hooks/store.hook";
import ListRooms from "@/modules/ListRooms/ListRooms";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import Dialogs from "@/modules/Dialogs/Dialogs";
// selectors & actions
import { createRoom, forwardMessageSocket, joinRoom } from "@/store/thunks/room";
// own types
import type {IForwardMessage, IRoom, TPreviewExistingRoom} from "@/models/room/IRoom.store";
import type {TValueOf} from "@/models/TUtils";
// styles
import "./main.scss";
import {createRoute} from "@/router/createRoute";
import {ROUTES} from "@/router/routes";
import {useRouter} from "next/navigation";
import CreateGroupModal from "@/modules/CreateGroupModal/CreateGroupModal";
import { TCreateGroupRoom } from "@/models/room/IRoom.store";

const {Content} = Layout;


const Main = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const rooms = useAppSelector(state => state.room.rooms);
    const [activeRoom, setActiveRoom] = useState<IRoom | TPreviewExistingRoom | null>(null);
    const [isOpenModalToForwardMessage, setIsOpenModalToForwardMessage] = useState<boolean>(false);
    const [isOpenModalToCreateGroup, setIsOpenModalToCreateGroup] = useState<boolean>(false);
    const [forwardedMessageId, setForwardedMessageId] = useState<TValueOf<Pick<IForwardMessage, "forwardedMessageId">> | null>(null);

    useEffect(() => {
        if (!user) {
            void router.push(createRoute({path: ROUTES.AUTH}));
        }
    }, [router, user]);

    useEffect(() => {
        // set the first found chat as an active one
        const currentModifiedRoom = activeRoom && rooms.find(room => room.id === activeRoom.id);
        if (currentModifiedRoom) {
            setActiveRoom(currentModifiedRoom);
        }
    }, [rooms, activeRoom]);

    const onChangeDialog = useCallback((roomId: TValueOf<Pick<IRoom, "id">>) => {
        const targetRoom = rooms.find(room => room.id === roomId)!;
        setActiveRoom(targetRoom);
    }, [rooms]);

    const onJoinRoom = useCallback(async (remoteRoom: TPreviewExistingRoom) => {
        try {
            // const actionResult = await dispatch(joinRoom(remoteRoom));
            // if (actionResult.meta.requestStatus === "rejected") {
            //     throw new Error();
            // }
            // const newRoom = actionResult.payload as IRoom;
            setActiveRoom(remoteRoom);
        }
        catch (error) {
            return;
        }
    }, []);

    const onCreateRoom = useCallback(async (remoteRoom: TCreateGroupRoom) => {
        try {
            const actionResult = await dispatch(createRoom(remoteRoom));
            if (actionResult.meta.requestStatus === "rejected") {
                throw new Error();
            }
            const newRoom = actionResult.payload as IRoom;
            setActiveRoom(newRoom);
        } catch (error) {
            return;
        }
    }, [dispatch]);

    const onClickRoom = (room: IRoom) => {
        setIsOpenModalToForwardMessage(false);
        if (!forwardedMessageId) {
            return;
        }

        void dispatch(
            forwardMessageSocket({
                roomId: room.id,
                forwardedMessageId: forwardedMessageId
            })
        );
    };
    const openModalToForwardMessage = useCallback((forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => {
        setForwardedMessageId(forwardedMessageId);
        setIsOpenModalToForwardMessage(true);
    }, []);

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
                okButtonProps={{ style: {display: "none"} }}
                cancelButtonProps={{ style: {display: "none"} }}
            >
                <ListRooms rooms={rooms} onClickRoom={onClickRoom}/>
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
