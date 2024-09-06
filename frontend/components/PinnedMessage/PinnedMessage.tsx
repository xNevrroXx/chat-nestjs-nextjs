import React, { FC } from "react";
import { Flex, Typography, theme, Button } from "antd";
import classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import { Interweave } from "interweave";
// own modules
import { useAppSelector } from "@/hooks/store.hook";
import { findMessageSelector } from "@/store/selectors/findMessage.selector";
import { IMessageBriefInfo, IRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
// styles
import "./pinned-message.scss";

const { useToken } = theme;
const { Text } = Typography;

interface IPinnedMessageProps {
    indexMessage: number;
    roomId: TValueOf<Pick<IRoom, "id">>;
    messageBriefInfo: IMessageBriefInfo;
    onClickPinMessage: () => void;
    onUnpinMessage: () => void;
}
const PinnedMessage: FC<IPinnedMessageProps> = ({
    roomId,
    messageBriefInfo,
    indexMessage,
    onClickPinMessage,
    onUnpinMessage,
}) => {
    const { token } = useToken();
    const message = useAppSelector((state) =>
        findMessageSelector(state, {
            roomId,
            messageBriefInfo: {
                id: messageBriefInfo.id,
                date: messageBriefInfo.date,
            },
        }),
    );

    if (!message) {
        return;
    }

    return (
        <Flex
            component="a"
            // @ts-ignore
            href={"#".concat(messageBriefInfo.id)}
            className={classNames("pinned-message")}
            data-reply-message-id={messageBriefInfo.id}
            style={{ color: token.colorText }}
            gap={4}
            justify={"space-between"}
        >
            <Flex vertical onClick={onClickPinMessage}>
                <div className="pinned-message__border">
                    <span>
                        <svg height="0" width="0">
                            <defs>
                                <clipPath id="clipPath4">
                                    <path
                                        d="M0,1a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,10.5a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,20a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,29.5a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0Z"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </span>
                    <div className="pinned-messages__mark"></div>
                </div>
                <Text strong>Пересланное сообщение #{indexMessage}</Text>
                {message.text && (
                    <Interweave
                        tagName="p"
                        content={emojiParser.parse(message.text, {
                            emojiCDN:
                                "https://cdnjs.cloudflare.com/ajax/libs/twemoji/",
                        })}
                    />
                )}
            </Flex>
            <Button onClick={onUnpinMessage}>unpin</Button>
        </Flex>
    );
};

export default PinnedMessage;
