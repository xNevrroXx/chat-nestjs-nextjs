"use client";

import React, { ChangeEventHandler, FC, useCallback, useMemo, useState, useTransition } from "react";
import Modal from "antd/es/modal/Modal";
import { RoomType, TCreateGroupRoom, TCreateRoom, TTemporarilyRoomOrUserBySearch } from "@/models/IStore/IRoom";
import { Form, Input, Mentions } from "antd";
import { useAppSelector } from "@/hooks/store.hook";
import { filteredUsersSelector } from "@/store/selectors/filteredUsersSelector";
import { getMentionIds } from "@/utils/getMentionIds";

interface IStages {
    0: "ENTER_GROUP_NAME",
    1: "ADD_MEMBERS"
}

const STAGES: IStages = {
    0: "ENTER_GROUP_NAME",
    1: "ADD_MEMBERS"
};

const COUNT_STAGES = Object.keys(STAGES).length;

interface IProps {
    onOk: (roomInfo: TCreateRoom) => void;
    onCloseModal: () => void;
    isOpen: boolean;
}

const CreateGroupModal: FC<IProps> = ({ onCloseModal, isOpen, onOk: onSuccessAction }) => {
    const users = useAppSelector<TTemporarilyRoomOrUserBySearch[]>(state => filteredUsersSelector(state));
    console.log("filteredLocalUsers: ", users);

    const [stage, setStage] = useState<keyof IStages>(0);
    const [roomName, setRoomName] = useState<string>("");
    const [memberIds, setMemberIds] = useState<string[]>([]);

    const onChangeMembers = useCallback((str: string) => {
        const ids = getMentionIds(str);
        setMemberIds(ids);
    }, []);

    const onOk = useCallback(() => {
        if (stage === COUNT_STAGES - 1) {
            // if the last stage is completed
            onSuccessAction({
                name: roomName,
                memberIds: memberIds,
                type: RoomType.GROUP
            });
            return;
        }

        setStage(prevState => (prevState + 1) as keyof IStages);
    }, [onSuccessAction, roomName, memberIds, stage]);

    const contentByStage = useMemo(() => {
        switch (stage) {
            case 0: {
                return (
                    <Form.Item<TCreateGroupRoom>
                        label="Название"
                        name="name"
                    >
                        <Input
                            onChange={e => {
                                setRoomName(e.target.value);
                            }}
                            value={roomName}
                        />
                    </Form.Item>
                );
            }
            case 1: {
                return (
                    <Form.Item<TCreateGroupRoom>
                        label="Участники"
                        name="memberIds"
                    >
                        <Mentions
                            placeholder="@username-1 @username-2"
                            autoSize={true}
                            value={
                                memberIds
                                    .map<string>(id => {
                                        const user = users.find(user => user.id === id)!;
                                        return "@" + user.name + " ";
                                    })
                                    .join("")
                            }
                            onChange={onChangeMembers}
                            onSelect={(e) => {
                                console.log("select: ", e);
                            }}
                            options={users/*.concat(data || [])*/.map(({ name, id }) => {
                                console.log("users: ", users);
                                const slicedId = id;
                                const formattedName = name.match(/ /) ? "\"" + name + "\"" : name;
                                return {
                                    key: id,
                                    value: formattedName + "-" + slicedId,
                                    label: (
                                        <>
                                            <span>{formattedName}-{slicedId}</span>
                                        </>
                                    )
                                };
                            })}
                        />
                    </Form.Item>
                );
            }
        }
    }, [memberIds, onChangeMembers, roomName, stage, users]);


    return (
        <Modal
            title="Новая группа"
            open={isOpen}
            onCancel={onCloseModal}
            okText={stage === COUNT_STAGES - 1 ? "Создать" : "Далее"}
            onOk={onOk}
        >

            <Form>
                {contentByStage}
            </Form>
        </Modal>
    );
};

export default CreateGroupModal;
