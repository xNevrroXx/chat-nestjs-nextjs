import React, { useCallback, useState } from "react";
import { Checkbox, Flex, Modal, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { closeModals } from "@/store/actions/modal-windows";
import { deleteGroup } from "@/store/thunks/room";
import { findRoomByIdSelector } from "@/store/selectors/findRoomById.selector";
import { RoomType } from "@/models/room/IRoom.store";
import { findInterlocutorByRoomIdSelector } from "@/store/selectors/findInterlocutorByRoomId.selector";

const { Text } = Typography;

const RoomDeletion = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.roomDeletion,
    );
    const room = useAppSelector((state) =>
        findRoomByIdSelector(state, modalInfo.isOpen ? modalInfo.roomId : null),
    );
    const interlocutor = useAppSelector((state) =>
        findInterlocutorByRoomIdSelector(state, room?.id),
    );
    const [isOnlyForMe, setIsOnlyForMe] = useState<boolean>(true);

    const onClose = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOk = useCallback(() => {
        if (!modalInfo.isOpen || !room) {
            return;
        }

        if (room.type === RoomType.PRIVATE) {
            void dispatch(
                deleteGroup({
                    id: modalInfo.roomId,
                    isOnlyForMe: isOnlyForMe,
                }),
            );
        }
        else {
            void dispatch(deleteGroup({ id: modalInfo.roomId }));
        }

        onClose();
    }, [dispatch, isOnlyForMe, modalInfo, onClose, room]);

    const toggleCheckbox = useCallback(() => {
        setIsOnlyForMe((prev) => !prev);
    }, []);

    return (
        <Modal
            title="Удалить группу"
            open={modalInfo.isOpen}
            onOk={onOk}
            onCancel={onClose}
        >
            <Flex vertical gap={"small"}>
                {room && room.type === RoomType.PRIVATE && interlocutor ? (
                    <>
                        <Checkbox
                            checked={!isOnlyForMe}
                            onChange={toggleCheckbox}
                        >
                            <Text>
                                Также удалить для{" "}
                                <b>{interlocutor.displayName}</b>
                            </Text>
                        </Checkbox>
                        {isOnlyForMe ? (
                            <Text>
                                Отправленные вами сообщения останутся у вашего
                                собеседника, но не у вас. Это действие нельзя
                                отменить.
                            </Text>
                        ) : (
                            <Text>
                                Все данные о переписке будут стерты. Это
                                действие нельзя отменить.
                            </Text>
                        )}
                    </>
                ) : (
                    <Text>
                        Все данные этого чата будут удалены. Это действие нельзя
                        отменить.
                    </Text>
                )}
            </Flex>
        </Modal>
    );
};

export default RoomDeletion;
