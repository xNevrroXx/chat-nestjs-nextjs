import React, { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { deleteAccount } from "@/store/thunks/authentication";
import { closeModals } from "@/store/actions/modal-windows";
import { Checkbox, Flex, Modal, Typography } from "antd";
import { IDepersonalizeOrDeleteAccount } from "@/models/users/IUsers.store";
import { TValueOf } from "@/models/TUtils";

const { Text } = Typography;

const AccountDeletion = () => {
    const dispatch = useAppDispatch();
    const modalInfo = useAppSelector(
        (state) => state.modalWindows.accountDeletion,
    );
    const [whetherDepersonalize, setWhetherDepersonalize] =
        useState<
            TValueOf<
                Pick<IDepersonalizeOrDeleteAccount, "whetherDepersonalize">
            >
        >("delete");

    const onCancel = useCallback(() => {
        dispatch(closeModals());
    }, [dispatch]);

    const onOk = useCallback(() => {
        onCancel();
        void dispatch(
            deleteAccount({
                whetherDepersonalize,
            }),
        );
    }, [dispatch, onCancel, whetherDepersonalize]);

    const toggleCheckbox = useCallback(() => {
        setWhetherDepersonalize((prev) =>
            prev == "delete" ? "depersonalize" : "delete",
        );
    }, []);

    return (
        <Modal
            title="Удаление аккаунта"
            open={modalInfo.isOpen}
            onOk={onOk}
            onCancel={onCancel}
        >
            <Flex vertical gap={"small"}>
                <Checkbox
                    checked={whetherDepersonalize === "depersonalize"}
                    onChange={toggleCheckbox}
                >
                    <Text>Оставить обезличенные сообщения</Text>
                </Checkbox>

                {whetherDepersonalize === "depersonalize" ? (
                    <Text>
                        Аккаунт будет обезличен, т.е. все ваши личные
                        данные(имя, фамилия, возраст, email и т.д.) будут
                        удалены. Но все сообщения написанные вами сохранятся и
                        будут видны другим пользователям.
                    </Text>
                ) : (
                    <Text>
                        Все данные будут удалены, включая отправленные вами
                        сообщения.
                    </Text>
                )}
            </Flex>
        </Modal>
    );
};

export default AccountDeletion;
