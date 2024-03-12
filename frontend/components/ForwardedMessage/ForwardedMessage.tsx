"use client";

import React, { FC, useMemo } from "react";
import { Flex, Typography } from "antd";
import { useAppSelector } from "@/hooks/store.hook";
import classNames from "classnames";
// own modules
import { messageOwnerSelector } from "@/store/selectors/messageOwner.selector";
import { IForwardedMessage } from "@/models/room/IRoom.store";
// styles
import "./forwarded-message.scss";
import Time from "@/components/Time/Time";

const { Text } = Typography;

type TMessageReplyProps = {
    message: IForwardedMessage;
    isMine: boolean;
};
const ForwardedMessage: FC<TMessageReplyProps> = ({ message, isMine }) => {
    const ownerMessage = useAppSelector((state) =>
        messageOwnerSelector(state, message.forwardedMessage.senderId),
    );

    const ownerMessageElem = useMemo(() => {
        if (!ownerMessage) {
            return;
        }

        return <Text strong>{ownerMessage.displayName}</Text>;
    }, [ownerMessage]);

    return (
        <Flex
            component="a"
            // @ts-ignore
            href={"#".concat(message.forwardedMessageId)}
            vertical
            className={classNames(
                "forwarded-message",
                isMine && "forwarded-message_mine",
            )}
            data-forwarded-message-id={message.forwardedMessageId}
        >
            {ownerMessageElem}

            {message.forwardedMessage.isDeleted ? (
                <Text type={"secondary"}>Сообщение удалено</Text>
            ) : (
                <Text>пересланное сообщение</Text>
            )}
        </Flex>
    );
};

export default ForwardedMessage;
