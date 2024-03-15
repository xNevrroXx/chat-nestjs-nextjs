"use client";

import React, { FC, Fragment, useMemo } from "react";
import { Flex, Typography, theme } from "antd";
import classNames from "classnames";
import { Interweave } from "interweave";
// own modules
import { useAppSelector } from "@/hooks/store.hook";
import { messageOwnerSelector } from "@/store/selectors/messageOwner.selector";
import {
    IInnerMessage,
    IInnerForwardedMessage,
    checkIsInnerMessage,
} from "@/models/room/IRoom.store";
// styles
import "./message-reply.scss";

const { useToken } = theme;
const { Text } = Typography;

type TMessageReplyProps = {
    message: IInnerMessage | IInnerForwardedMessage;
    isInput?: boolean;
};
const MessageReply: FC<TMessageReplyProps> = ({ message, isInput }) => {
    const { token } = useToken();
    const ownerMessage = useAppSelector((state) =>
        messageOwnerSelector(state, message.senderId),
    );

    const ownerMessageElem = useMemo(() => {
        if (!ownerMessage) {
            return;
        }

        return (
            <Text style={{ color: ownerMessage.color }}>
                {ownerMessage.displayName}
            </Text>
        );
    }, [ownerMessage]);

    const content = useMemo(() => {
        if (message.isDeleted) {
            return <Text type={"secondary"}>Сообщение удалено</Text>;
        }
        else if (checkIsInnerMessage(message)) {
            return (
                <Fragment>
                    {message.files && message.files.length > 0 && (
                        <Text italic>вложения: {message.files.length}</Text>
                    )}

                    {message.text && (
                        <Interweave
                            className="message-reply__text"
                            tagName="span"
                            content={message.text}
                        />
                    )}
                </Fragment>
            );
        }
        else {
            return (
                <Fragment>
                    <Text>1 пересланное сообщение</Text>
                </Fragment>
            );
        }
    }, [message]);

    return (
        <Flex
            component="a"
            // @ts-ignore
            href={"#".concat(message.id)}
            className={classNames(
                "message-reply",
                isInput && "message-reply_input",
            )}
            vertical
            data-reply-message-id={message.id}
            style={{ color: token.colorText }}
        >
            {ownerMessageElem}

            {content}
        </Flex>
    );
};

export default MessageReply;
