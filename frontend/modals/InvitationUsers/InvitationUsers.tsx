import React, { useCallback, useMemo, useRef, useState } from "react";
import { Form, Mentions, Modal } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { filteredUsersSelector } from "@/store/selectors/filteredUsers.selector";
import { closeModals } from "@/store/actions/modal-windows";
import { getMentionIds } from "@/utils/getMentionIds";
import { inviteUsers } from "@/store/thunks/room";
import { MentionsRef } from "antd/lib/mentions";
import { TInviteUsers } from "@/models/room/IRoom.store";

const InvitationUsers = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.invitationUsers,
    );
    const users = useAppSelector((state) => filteredUsersSelector(state));
    const [mentionIds, setMentionIds] = useState<string[]>([]);
    const mentionsRef = useRef<MentionsRef | null>(null);

    const onClose = useCallback(() => {
        dispatch(closeModals());

        setMentionIds([]);
        form.resetFields();
    }, [dispatch, form]);

    const onChangeMembers = useCallback((str: string) => {
        const ids = getMentionIds(str);
        setMentionIds(ids);
    }, []);

    const onOk = useCallback(() => {
        if (!modalInfo.isOpen) {
            return;
        }

        void dispatch(
            inviteUsers({
                roomId: modalInfo.roomId,
                mentionIds: mentionIds,
            }),
        );

        onClose();
    }, [dispatch, mentionIds, modalInfo, onClose]);

    const mentionOptions = useMemo(() => {
        return users
            .filter((user) => !mentionIds.includes(user.id))
            .map(({ displayName, id }) => {
                const slicedId = id;
                const formattedName = displayName.match(/ /)
                    ? '"' + displayName + '"'
                    : displayName;
                return {
                    key: id,
                    value: formattedName + "-" + slicedId,
                    label: `${formattedName}-${slicedId}`,
                };
            });
    }, [mentionIds, users]);

    return (
        <Modal
            title="Приглашение пользователей в группу"
            open={modalInfo.isOpen}
            onCancel={onClose}
            okText={"Пригласить"}
            okButtonProps={{ disabled: mentionIds.length === 0 }}
            onOk={onOk}
        >
            <Form form={form}>
                <Form.Item<TInviteUsers>
                    name={"mentionIds"}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Mentions
                        ref={mentionsRef}
                        allowClear={true}
                        style={{ width: "100%" }}
                        placeholder="@username-1 @username-2 ..."
                        autoSize={true}
                        options={mentionOptions}
                        onChange={onChangeMembers}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InvitationUsers;
