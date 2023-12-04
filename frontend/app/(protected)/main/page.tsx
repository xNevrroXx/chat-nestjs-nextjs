"use client";

import {Fragment, useCallback, useEffect, useState} from "react";
import {Layout, Modal} from "antd";
// own modules
import {useAppDispatch, useAppSelector} from "@/hooks/store.hook";
import ListRooms from "@/modules/ListRooms/ListRooms";
import ActiveRoom from "@/modules/ActiveRoom/ActiveRoom";
import Dialogs from "@/modules/Dialogs/Dialogs";
// selectors & actions
import {createRoom, forwardMessageSocket} from "@/store/thunks/room";
// own types
import type {IForwardMessage, IRoom, TTemporarilyRoomOrUserBySearch} from "@/models/IStore/IRoom";
import type {TValueOf} from "@/models/TUtils";
// styles
import "./main.scss";
import {createRoute} from "@/router/createRoute";
import {ROUTES} from "@/router/routes";
import {useRouter} from "next/navigation";
import CreateGroupModal from "@/modules/CreateGroupModal/CreateGroupModal";
import { TCreateRoom } from "@/models/IStore/IRoom";

const {Content} = Layout;


const Main = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const rooms = useAppSelector(state => state.room.rooms);
    const [activeRoom, setActiveRoom] = useState<IRoom | null>(null);
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

    const onCreateNewDialog = useCallback((remoteRoom: TTemporarilyRoomOrUserBySearch | TCreateRoom) => {
        void dispatch(createRoom(remoteRoom));
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
                    onChangeDialog={onChangeDialog}
                    onCreateNewDialog={onCreateNewDialog}
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
                onOk={(roomInfo: TCreateRoom) => onCreateNewDialog(roomInfo)}
                onCloseModal={closeModalToCreateGroup}
                isOpen={isOpenModalToCreateGroup}
            />
        </Fragment>
    );
};

export default Main;
