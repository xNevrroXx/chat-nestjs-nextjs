"use client";

import React, { FC, Fragment, useEffect, useMemo } from "react";
import { Flex, Typography, theme } from "antd";
import classNames from "classnames";
import { Interweave } from "interweave";
// own modules
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { messageOwnerSelector } from "@/store/selectors/messageOwner.selector";
import {
    IInnerStandardMessage,
    checkIsStandardMessage,
    checkIsOriginalMessage,
} from "@/models/room/IRoom.store";
// styles
import "./message-reply.scss";
import { findMessageSelector } from "@/store/selectors/findMessageSelector";
import { TValueOf } from "@/models/TUtils";
import emojiParser from "universal-emoji-parser";
import { transform } from "@/utils/inrterweaveTransform";
import { UrlMatcher } from "interweave-autolink";
import { getMessageById } from "@/store/thunks/room";

const { useToken } = theme;
const { Text } = Typography;

type TSubMessageProps = {
    messageBriefInfo: NonNullable<
        TValueOf<Pick<IInnerStandardMessage, "replyToMessage">>
    >;
    roomId: string;
    isInput?: boolean;
    type?: "answer" | "forwarded";
};
const SubMessage: FC<TSubMessageProps> = ({
    messageBriefInfo,
    isInput,
    roomId,
}) => {
    const { token } = useToken();
    const dispatch = useAppDispatch();
    const message = useAppSelector((state) =>
        findMessageSelector(state, { roomId, messageBriefInfo }),
    );

    useEffect(() => {
        if (!(message == null)) {
            return;
        }

        void dispatch(getMessageById(messageBriefInfo.id));
    }, [dispatch, message, messageBriefInfo.id]);

    const ownerMessage = useAppSelector((state) =>
        messageOwnerSelector(state, message && message.senderId),
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
        if (!message || message.isDeleted) {
            return <Text type={"secondary"}>Сообщение удалено</Text>;
        }
        else if (checkIsStandardMessage(message)) {
            return (
                <Fragment>
                    {message.files && message.files.length > 0 && (
                        <Text italic>вложения: {message.files.length}</Text>
                    )}

                    {message.text && (
                        <Interweave
                            className="sub-message__text"
                            tagName="span"
                            transform={transform}
                            matchers={[
                                new UrlMatcher("url", { validateTLD: false }),
                            ]}
                            content={emojiParser.parse(message.text)}
                        />
                    )}
                </Fragment>
            );
        }
        else if (checkIsOriginalMessage(message)) {
            return (
                <Fragment>
                    {message.text && (
                        <Interweave
                            className="sub-message__text"
                            tagName="span"
                            transform={transform}
                            matchers={[
                                new UrlMatcher("url", { validateTLD: false }),
                            ]}
                            content={emojiParser.parse(message.text)}
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
            href={"#".concat(messageBriefInfo.id)}
            className={classNames(
                "sub-message",
                isInput && "sub-message_input",
            )}
            vertical
            data-reply-message-id={messageBriefInfo.id}
            style={{ color: token.colorText }}
        >
            {ownerMessageElem}

            {content}
        </Flex>
    );
};

export default SubMessage;
