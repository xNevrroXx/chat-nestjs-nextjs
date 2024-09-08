import {
    MenuFoldOutlined,
    PhoneOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import { Button, ConfigProvider, Flex, Layout, theme, Typography } from "antd";
import React, { type FC, useCallback, useMemo, useRef, useState } from "react";
// own modules
import $api from "@/http";
import { useScrollTrigger } from "@/hooks/useScrollTrigger.hook";
import RoomContent from "@/components/RoomContent/RoomContent";
import ScrollDownButton from "@/components/ScrollDownButton/ScrollDownButton";
import InputMessage from "@/modules/InputMessage/InputMessage";
import type { IUserDto } from "@/models/auth/IAuth.store";
import type { TValueOf } from "@/models/TUtils";
import {
    checkIsPreviewExistingRoomWithFlag,
    FileType,
    IEditMessage,
    IRoom,
    RoomType,
    TPreviewExistingRoomWithFlag,
    TRoomWithPreviewFlag,
    TSendMessage,
} from "@/models/room/IRoom.store";
import {
    MessageAction,
    TMessageForAction,
    TMessageForActionEditOrReply,
} from "@/models/room/IRoom.general";
import PinnedMessages from "../PinnedMessages/PinnedMessages";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { truncateTheText } from "@/utils/truncateTheText";
import darkTheme from "@/theme/dark.theme";
// actions
import {
    editMessageSocket,
    sendMessageSocket,
    toggleUserTypingSocket,
} from "@/store/thunks/room";
import { openCallModal } from "@/store/actions/modal-windows";
// styles
import "./active-room.scss";

const { Header, Footer } = Layout;
const { Text, Title } = Typography;

const { useToken } = theme;

type TJoinRoomFn = () => Promise<IRoom | undefined>;
interface IActiveChatProps {
    user: IUserDto;
    room: TRoomWithPreviewFlag | TPreviewExistingRoomWithFlag | null;
    onCloseRoom: () => void;
    onJoinRoom: TJoinRoomFn;
}

const ActiveRoom: FC<IActiveChatProps> = ({
    user,
    room,
    onCloseRoom,
    onJoinRoom,
}) => {
    const { token } = useToken();
    const dispatch = useAppDispatch();
    const deviceDimensions = useAppSelector((state) => state.device);
    const typingTimoutRef = useRef<NodeJS.Timeout | null>(null);
    const interlocutor = useAppSelector((state) => {
        if (!room || room.type === RoomType.GROUP || !room.participants) return;
        return state.users.users.find(
            (user) => user.id === room.participants[0].userId,
        );
    });
    const [messageForAction, setMessageForAction] =
        useState<TMessageForAction | null>(null);
    const [isVisibleScrollButtonState, setIsVisibleScrollButtonState] =
        useState<boolean>(true);
    const isNeedScrollToLastMessage = useRef<boolean>(true);
    const refChatContent = useScrollTrigger({
        onIntersectionBreakpoint: {
            toTop: () => {
                setIsVisibleScrollButtonState(true);
                isNeedScrollToLastMessage.current = false;
            },
            toBottom: () => {
                setIsVisibleScrollButtonState(false);
                isNeedScrollToLastMessage.current = true;
            },
        },
        breakpointPx: 350,
    });

    const onInitCall = useCallback(() => {
        if (!room || checkIsPreviewExistingRoomWithFlag(room)) {
            return;
        }

        dispatch(openCallModal({ roomId: room.id }));
    }, [dispatch, room]);

    const onClickScrollButton = () => {
        if (!refChatContent.current) return;

        refChatContent.current.scrollTo(
            0,
            refChatContent.current?.scrollHeight,
        );
    };

    const onChooseMessageForAction = useCallback(
        (messageForAction: TMessageForAction | null) => {
            setMessageForAction(messageForAction);
        },
        [],
    );

    const removeMessageForAction = useCallback(() => {
        setMessageForAction(null);
    }, []);

    const onTyping = useCallback(() => {
        if (!room || checkIsPreviewExistingRoomWithFlag(room)) {
            return;
        }

        if (typingTimoutRef.current) {
            // if the user has recently typed
            clearTimeout(typingTimoutRef.current);

            typingTimoutRef.current = setTimeout(() => {
                void dispatch(
                    toggleUserTypingSocket({
                        roomId: room.id,
                        isTyping: false,
                    }),
                );
                typingTimoutRef.current = null;
            }, 4000);

            return;
        }

        void dispatch(
            toggleUserTypingSocket({
                roomId: room.id,
                isTyping: true,
            }),
        );

        typingTimoutRef.current = setTimeout(() => {
            void dispatch(
                toggleUserTypingSocket({
                    roomId: room.id,
                    isTyping: false,
                }),
            );
            typingTimoutRef.current = null;
        }, 4000);
    }, [dispatch, room]); // todo: need fix, because during the change the active room - the typing status will not change back

    const onSendEditedMessage = (
        text: TValueOf<Pick<IEditMessage, "text">>,
    ) => {
        if (!messageForAction || messageForAction.action !== MessageAction.EDIT)
            return;

        void dispatch(
            editMessageSocket({
                messageId: messageForAction.message.id,
                text: text,
            }),
        );
        removeMessageForAction();
    };

    const onSendMessage = useCallback(
        async (
            text: TValueOf<Pick<TSendMessage, "text">>,
            attachmentIds: string[],
        ) => {
            if (!room) return;

            if (typingTimoutRef.current) {
                clearTimeout(typingTimoutRef.current);
                typingTimoutRef.current = null;
            }

            const messageWithoutRoomId: Omit<TSendMessage, "roomId"> = {
                text,
                attachmentIds,
                replyToMessageId:
                    messageForAction &&
                    messageForAction.action === MessageAction.REPLY
                        ? messageForAction.message.id
                        : null,
            };

            let message: TSendMessage;
            if (
                checkIsPreviewExistingRoomWithFlag(room) &&
                room.type === RoomType.PRIVATE
            ) {
                const newRoom = await onJoinRoom();
                if (!newRoom) {
                    return;
                }
                message = {
                    roomId: newRoom.id,
                    ...messageWithoutRoomId,
                };
            }
            else {
                message = {
                    roomId: room.id,
                    ...messageWithoutRoomId,
                };
            }

            void dispatch(sendMessageSocket(message));
            removeMessageForAction();
        },
        [room, messageForAction, removeMessageForAction, onJoinRoom, dispatch],
    );

    const sendVoiceMessage = async (record: Blob) => {
        if (!room) {
            return;
        }

        const file = new File([record], "", {
            type: "audio/webm",
        });

        const formData = new FormData();
        formData.set("file", file, "set-random");
        formData.set("roomId", room.id);
        formData.set("fileType", FileType.VOICE_RECORD);

        const response = await $api.post<{ id: string }>(
            process.env.NEXT_PUBLIC_BASE_URL + "/file/upload",
            formData,
        );

        void onSendMessage(null, [response.data.id]);
    };

    const userStatuses: string = useMemo(() => {
        if (!room || !room.participants || room.participants.length === 0) {
            return "";
        }

        switch (room.type) {
            case RoomType.PRIVATE: {
                if (!interlocutor || !interlocutor.userOnline.isOnline) {
                    return "Не в сети";
                }
                else if (room.participants[0].isTyping) {
                    return "Печатает...";
                }
                return "В сети";
            }
            case RoomType.GROUP: {
                const typingUsersText = room.participants
                    .filter((participant) => participant.isTyping)
                    .map((participant) => participant.nickname + "...")
                    .join(" ");

                return truncateTheText({
                    text: typingUsersText,
                    maxLength: 50,
                });
            }
        }
    }, [room, interlocutor]);

    if (!room) {
        return (
            <ConfigProvider
                theme={{
                    ...darkTheme,
                    token: {
                        colorBgLayout: "#0e1621",
                    },
                }}
            >
                <Layout>
                    <Flex
                        className="active-room__not-exist"
                        justify="center"
                        align="center"
                    >
                        <Title
                            level={5}
                            style={{ color: token.colorTextSecondary }}
                        >
                            Выберите чат
                        </Title>
                    </Flex>
                </Layout>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider
            theme={{
                ...darkTheme,
                token: {
                    colorBgLayout: "#0e1621",
                },
            }}
        >
            <Layout className={"active-room"}>
                <Header className="active-room__header">
                    <Button
                        onClick={onCloseRoom}
                        className={"active-room__return-btn"}
                        type={"text"}
                        size={"large"}
                        icon={<LeftOutlined />}
                    />
                    <div className="active-room__info">
                        <div className="active-room__wrapper">
                            <Title level={5} className="active-room__name">
                                {room.name}
                            </Title>
                            <Flex gap={"small"}>
                                {room.type === RoomType.GROUP && (
                                    <Text
                                        style={{
                                            color: token.colorTextDisabled,
                                        }}
                                        className="active-room__status"
                                    >
                                        {room.participants.filter(
                                            (member) => member.isStillMember,
                                        ).length +
                                            (room.isPreview ? 0 : 1)}{" "}
                                        уч.
                                    </Text>
                                )}
                                <Text
                                    style={{ color: token.colorTextDisabled }}
                                    className="active-room__status"
                                >
                                    {userStatuses}
                                </Text>
                            </Flex>
                        </div>
                    </div>
                    {deviceDimensions.screen.width > 1024 && (
                        <PinnedMessages roomId={room.id} />
                    )}
                    <div className="active-room__options">
                        {!checkIsPreviewExistingRoomWithFlag(room) && (
                            <PhoneOutlined
                                onClick={onInitCall}
                                className="custom"
                            />
                        )}
                        <MenuFoldOutlined className="custom" />
                    </div>
                </Header>
                {deviceDimensions.screen.width <= 1024 && (
                    <PinnedMessages roomId={room.id} />
                )}

                <RoomContent
                    className="active-room__content"
                    ref={refChatContent}
                    user={user}
                    room={room}
                    isNeedScrollToLastMessage={isNeedScrollToLastMessage}
                    onChooseMessageForAction={onChooseMessageForAction}
                />

                <Footer className="active-room__footer">
                    {isVisibleScrollButtonState && (
                        <ScrollDownButton
                            onClick={onClickScrollButton}
                            /*todo dynamically change amount of the unread messages*/
                            amountUnreadMessages={0}
                        />
                    )}

                    {room &&
                    checkIsPreviewExistingRoomWithFlag(room) &&
                    room.type === RoomType.GROUP ? (
                        <Button
                            onClick={onJoinRoom}
                            block
                            style={{ marginBottom: "10px" }}
                        >
                            Вступить в группу
                        </Button>
                    ) : (
                        <InputMessage
                            changeMessageForAction={onChooseMessageForAction}
                            messageForAction={
                                messageForAction &&
                                (messageForAction.action ===
                                    MessageAction.EDIT ||
                                    messageForAction.action ===
                                        MessageAction.REPLY)
                                    ? (messageForAction as TMessageForActionEditOrReply)
                                    : null
                            }
                            removeMessageForAction={removeMessageForAction}
                            onTyping={onTyping}
                            onSendMessage={onSendMessage}
                            onSendVoiceMessage={sendVoiceMessage}
                            onSendEditedMessage={onSendEditedMessage}
                        />
                    )}
                </Footer>
            </Layout>
        </ConfigProvider>
    );
};

export default ActiveRoom;
