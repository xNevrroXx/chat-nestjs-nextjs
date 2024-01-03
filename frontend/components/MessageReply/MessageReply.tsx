"use client";

import React, { FC, Fragment, useMemo } from "react";
import { Flex, Typography, theme } from "antd";
import classNames from "classnames";
import { Interweave } from "interweave";
// own modules
import { useAppSelector } from "@/hooks/store.hook";
import { messageOwnerSelector } from "@/store/selectors/messageOwnerSelector";
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
        messageOwnerSelector(state, message),
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

            {checkIsInnerMessage(message) ? (
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
            ) : (
                <Fragment>
                    <Text>1 пересланное сообщение</Text>
                </Fragment>
            )}
        </Flex>
    );
};

export default MessageReply;
