import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, Flex, Modal, Typography } from "antd";
import { RoomType } from "@/models/room/IRoom.store";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { closeModals } from "@/store/actions/modal-windows";
import { deleteMessageSocket } from "@/store/thunks/room";
import { isMeMessageOwnerSelector } from "@/store/selectors/isMeMessageOwner.selector";
import { findRoomByIdSelector } from "@/store/selectors/findRoomById.selector";

const { Text } = Typography;

const MessageDeletion = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.messageDeletion,
    );
    const isMeMessageOwner = useAppSelector((state) =>
        isMeMessageOwnerSelector(
            state,
            modalInfo.isOpen ? modalInfo.senderId : null,
        ),
    );
    const room = useAppSelector((state) =>
        findRoomByIdSelector(state, modalInfo.isOpen ? modalInfo.roomId : null),
    );
    const [isForEveryone, setIsForEveryone] = useState<boolean>(false);

    useEffect(() => {
        if (!room || room.type === RoomType.PRIVATE || !isMeMessageOwner) {
            setIsForEveryone(false);
            return;
        }

        setIsForEveryone(true);
    }, [isMeMessageOwner, room]);

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOk = useCallback(() => {
        if (!modalInfo.isOpen) {
            return;
        }

        void dispatch(
            deleteMessageSocket({
                messageId: modalInfo.messageId,
                isForEveryone,
            }),
        );
        onClose();
    }, [dispatch, isForEveryone, modalInfo, onClose]);

    const toggleIsForEveryone = useCallback(() => {
        setIsForEveryone((prev) => !prev);
    }, []);

    if (!room) {
        return;
    }

    return (
        <Modal
            title="Вы хотите удалить сообщение?"
            onCancel={onClose}
            onOk={onOk}
            open={modalInfo.isOpen}
        >
            <Flex vertical gap={"small"}>
                {room.type === RoomType.PRIVATE && isMeMessageOwner && (
                    <Checkbox
                        checked={isForEveryone}
                        onChange={toggleIsForEveryone}
                    >
                        <Text>Удалить у всех</Text>
                    </Checkbox>
                )}

                {isForEveryone ? (
                    <Text>Сообщение будет удалено у всех в этом чате.</Text>
                ) : (
                    <Text>Сообщение будет удалено только у вас.</Text>
                )}
            </Flex>
        </Modal>
    );
};

export default MessageDeletion;
