"use client";

import React, { FC, useCallback, useState } from "react";
import { RoomType, TCreateGroupRoom } from "@/models/room/IRoom.store";
import { Form, Input, Mentions, Modal } from "antd";
import { useAppSelector } from "@/hooks/store.hook";
import { filteredUsersSelector } from "@/store/selectors/filteredUsers.selector";
import { getMentionIds } from "@/utils/getMentionIds";

interface IStages {
    0: "ENTER_GROUP_NAME";
    1: "ADD_MEMBERS";
}

const STAGES: IStages = {
    0: "ENTER_GROUP_NAME",
    1: "ADD_MEMBERS",
};

const COUNT_STAGES = Object.keys(STAGES).length;

interface IProps {
    onOk: (roomInfo: TCreateGroupRoom) => void;
    onCloseModal: () => void;
    isOpen: boolean;
}

const CreateGroupModal: FC<IProps> = ({
    onCloseModal,
    isOpen,
    onOk: onSuccessAction,
}) => {
    const users = useAppSelector((state) => filteredUsersSelector(state));
    const [roomNameInputMessage, setRoomNameInputMessage] = useState<
        string | null
    >(null);
    const [stage, setStage] = useState<keyof IStages>(0);
    const [roomName, setRoomName] = useState<string>("");
    const [memberIds, setMemberIds] = useState<string[]>([]);

    const onChangeMembers = useCallback((str: string) => {
        const ids = getMentionIds(str);
        setMemberIds(ids);
    }, []);

    const onOk = useCallback(() => {
        if (stage === 0 && (roomName.length < 1 || roomName.length > 30)) {
            setRoomNameInputMessage("Введите от 1-го до 30-го символов");
            return;
        }

        if (stage !== COUNT_STAGES - 1) {
            setStage((prevState) => (prevState + 1) as keyof IStages);
            return;
        }

        // if the last stage is completed
        onSuccessAction({
            name: roomName,
            memberIds: memberIds,
            type: RoomType.GROUP,
        });
        setStage(0);
        setRoomName("");
        setRoomNameInputMessage(null);
        setMemberIds([]);
    }, [onSuccessAction, roomName, memberIds, stage]);

    return (
        <Modal
            title="Новая группа"
            open={isOpen}
            onCancel={onCloseModal}
            okText={stage === COUNT_STAGES - 1 ? "Создать" : "Далее"}
            onOk={onOk}
        >
            <Form>
                <Form.Item<TCreateGroupRoom>
                    style={{ display: stage === 0 ? "block" : "none" }}
                    label="Название"
                    name="name"
                    help={roomNameInputMessage}
                    validateStatus={roomNameInputMessage ? "error" : undefined}
                >
                    <Input
                        onChange={(e) => {
                            setRoomName(e.target.value);
                        }}
                        value={roomName}
                    />
                </Form.Item>

                <Form.Item<TCreateGroupRoom>
                    label="Участники"
                    name="memberIds"
                    style={{ display: stage === 1 ? "block" : "none" }}
                >
                    <Mentions
                        placeholder="@username-1 @username-2 ..."
                        autoSize={true}
                        value={memberIds
                            .map<string>((id) => {
                                const user = users.find(
                                    (user) => user.id === id,
                                )!;
                                return "@" + user.name + " ";
                            })
                            .join("")}
                        onChange={onChangeMembers}
                        options={users /*.concat(data || [])*/
                            .map(({ name, id }) => {
                                const slicedId = id;
                                const formattedName = name.match(/ /)
                                    ? '"' + name + '"'
                                    : name;
                                return {
                                    key: id,
                                    value: formattedName + "-" + slicedId,
                                    label: (
                                        <>
                                            <span>
                                                {formattedName}-{slicedId}
                                            </span>
                                        </>
                                    ),
                                };
                            })}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateGroupModal;
