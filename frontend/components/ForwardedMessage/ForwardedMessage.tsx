"use client";

import React, { FC, useMemo } from "react";
import { Flex, Typography } from "antd";
import { useAppSelector } from "@/hooks/store.hook";
import classNames from "classnames";
// own modules
import { messageOwnerSelector } from "@/store/selectors/messageOwnerSelector";
import { IForwardedMessage } from "@/models/room/IRoom.store";
// styles
import "./forwarded-message.scss";

const { Text } = Typography;

type TMessageReplyProps = {
    message: IForwardedMessage;
    isMine: boolean;
};
const ForwardedMessage: FC<TMessageReplyProps> = ({ message, isMine }) => {
    const ownerMessage = useAppSelector((state) =>
        messageOwnerSelector(state, message.forwardedMessage),
    );

    const ownerMessageElem = useMemo(() => {
        if (!ownerMessage) {
            return;
        }

        return <Text strong>{ownerMessage.displayName}</Text>;
    }, [ownerMessage]);

    return (
        <Flex
            vertical
            className={classNames(
                "forwarded-message",
                isMine && "forwarded-message_mine",
            )}
            data-forwarded-message-id={message.id}
        >
            {ownerMessageElem}

            <a href={"#".concat(message.forwardedMessage.id)}>
                пересланное сообщение
            </a>
        </Flex>
    );
};

export default ForwardedMessage;
