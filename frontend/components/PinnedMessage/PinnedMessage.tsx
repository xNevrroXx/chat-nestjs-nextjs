import React, { FC } from "react";
import { Flex, Typography, theme } from "antd";
import classNames from "classnames";
import emojiParser from "universal-emoji-parser";
// own modules
import { TPinnedMessage } from "@/models/room/IRoom.store";
// styles
import "./pinned-message.scss";
import { Interweave } from "interweave";

const { useToken } = theme;
const { Text } = Typography;

interface IPinnedMessageProps {
    index: number;
    pinnedMessage: TPinnedMessage;
}
const PinnedMessage: FC<IPinnedMessageProps> = ({ pinnedMessage, index }) => {
    const { token } = useToken();

    return (
        <Flex
            component="a"
            // @ts-ignore
            href={"#".concat(pinnedMessage.messageId)}
            className={classNames("pinned-message")}
            vertical
            data-reply-message-id={pinnedMessage.messageId}
            style={{ color: token.colorText }}
            gap={4}
        >
            <Text strong>Пересланное сообщение #{index}</Text>
            {pinnedMessage.text && (
                <Interweave
                    tagName="p"
                    content={emojiParser.parse(pinnedMessage.text, {
                        emojiCDN:
                            "https://cdnjs.cloudflare.com/ajax/libs/twemoji/",
                    })}
                />
            )}
        </Flex>
    );
};

export default PinnedMessage;
