import { useCallback } from "react";
import { Modal } from "antd";
import ListRooms from "@/modules/ListRooms/ListRooms";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { closeModals } from "@/store/actions/modal-windows";
import { forwardMessageSocket } from "@/store/thunks/room";
import type { IRoom } from "@/models/room/IRoom.store";

const MessageForwarding = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.messageForwarding,
    );
    const roomByIds = useAppSelector((state) => state.room.local.rooms.byId);

    const onClickRoomToForwardMessage = (room: IRoom) => {
        onClose();
        if (!modalInfo.forwardingMessageId) {
            return;
        }

        void dispatch(
            forwardMessageSocket({
                roomId: room.id,
                forwardedMessageId: modalInfo.forwardingMessageId,
            }),
        );
    };

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    return (
        <Modal
            title="Переслать сообщение"
            open={modalInfo.isOpen}
            onCancel={onClose}
            okButtonProps={{ style: { display: "none" } }}
            cancelButtonProps={{ style: { display: "none" } }}
        >
            <ListRooms
                rooms={Object.values(roomByIds)}
                onClickRoom={onClickRoomToForwardMessage}
            />
        </Modal>
    );
};

export default MessageForwarding;
