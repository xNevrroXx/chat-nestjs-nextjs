import React, { FC } from "react";
import { Flex, Typography, theme, Button, Row, Col } from "antd";
import classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import { Interweave } from "interweave";
import { PushpinOutlined } from "@ant-design/icons";
// own modules
import { IRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { findMessageSelector } from "@/store/selectors/findMessage.selector";
// styles
import "./pinned-message.scss";

const { useToken } = theme;
const { Text } = Typography;

interface IPinnedMessageProps {
    indexMessage: number;
    roomId: TValueOf<Pick<IRoom, "id">>;
    message: NonNullable<ReturnType<typeof findMessageSelector>>;
    onClickPinMessage: () => void;
    onUnpinMessage: () => void;
}
const PinnedMessage: FC<IPinnedMessageProps> = ({
    message,
    indexMessage,
    onClickPinMessage,
    onUnpinMessage,
}) => {
    const { token } = useToken();

    return (
        <Row
            className={classNames("pinned-message")}
            data-reply-message-id={message.id}
            style={{
                color: token.colorText,
            }}
            gutter={1}
            justify={"space-between"}
        >
            <Col span={20} onClick={onClickPinMessage}>
                <Flex
                    className={"pinned-message__flex-container"}
                    gap={"small"}
                >
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
                    <Flex
                        className={"pinned-message__flex-container"}
                        vertical
                        component={"a"}
                        // @ts-ignore
                        href={"#".concat(message.id)}
                    >
                        <Text strong style={{ fontSize: token.fontSize }}>
                            Закрепленное сообщение #{indexMessage}
                        </Text>
                        <Text
                            ellipsis={true}
                            style={{ fontSize: token.fontSizeSM }}
                        >
                            {message.text && (
                                <Interweave
                                    noWrap
                                    content={emojiParser.parse(message.text, {
                                        emojiCDN:
                                            "https://cdnjs.cloudflare.com/ajax/libs/twemoji/",
                                    })}
                                />
                            )}
                        </Text>
                    </Flex>
                </Flex>
            </Col>
            <Col span={3}>
                <Flex
                    className={
                        "pinned-message__flex-container pinned-message__flex-container_justify-right"
                    }
                    align={"center"}
                >
                    <Button
                        size={"large"}
                        style={{ display: "flex" }}
                        icon={<PushpinOutlined />}
                        onClick={onUnpinMessage}
                        type={"text"}
                    />
                </Flex>
            </Col>
        </Row>
    );
};

export default PinnedMessage;
