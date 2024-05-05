import {
    MenuFoldOutlined,
    PhoneOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import {
    Button,
    Checkbox,
    ConfigProvider,
    Flex,
    Layout,
    Modal,
    theme,
    Typography,
} from "antd";
import React, { type FC, useCallback, useMemo, useRef, useState } from "react";
// own modules
import { useScrollTrigger } from "@/hooks/useScrollTrigger.hook";
import RoomContent from "@/components/RoomContent/RoomContent";
import ScrollDownButton from "@/components/ScrollDownButton/ScrollDownButton";
import InputMessage from "@/modules/InputMessage/InputMessage";
import type { IUserDto } from "@/models/auth/IAuth.store";
import type { TValueOf } from "@/models/TUtils";
import {
    checkIsPreviewExistingRoomWithFlag,
    FileType,
    IAttachment,
    IEditMessage,
    IForwardMessage,
    IRoom,
    RoomType,
    TPreviewExistingRoomWithFlag,
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
    deleteMessageSocket,
    editMessageSocket,
    pinMessageSocket,
    sendMessageSocket,
    toggleUserTypingSocket,
} from "@/store/thunks/room";
// styles
import "./active-room.scss";
import $api from "@/http";

const { Header, Footer } = Layout;
const { Text, Title } = Typography;

const { useToken } = theme;

type TJoinRoomFn = () => Promise<IRoom | undefined>;
interface IActiveChatProps {
    user: IUserDto;
    room: IRoom | TPreviewExistingRoomWithFlag | null | undefined;
    onCloseRoom: () => void;
    openModalToForwardMessage: (
        forwardedMessageId: TValueOf<
            Pick<IForwardMessage, "forwardedMessageId">
        >,
    ) => void;
    onJoinRoom: TJoinRoomFn;
    onInitCall: () => void;
}

const ActiveRoom: FC<IActiveChatProps> = ({
    user,
    room,
    onCloseRoom,
    openModalToForwardMessage,
    onJoinRoom,
    onInitCall,
}) => {
    const { token } = useToken();
    const dispatch = useAppDispatch();
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
        if (!room || checkIsPreviewExistingRoomWithFlag(room)) return;

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

    const onDeleteMessage = () => {
        if (
            !messageForAction ||
            messageForAction.action !== MessageAction.DELETE
        )
            return;

        void dispatch(
            deleteMessageSocket({
                messageId: messageForAction.message.id,
                isForEveryone: messageForAction.isForEveryone,
            }),
        );
        removeMessageForAction();
    };

    const onPinMessage = useCallback(() => {
        if (
            !room ||
            !messageForAction ||
            messageForAction.action !== MessageAction.PIN
        )
            return;

        void dispatch(
            pinMessageSocket({
                roomId: room.id,
                messageId: messageForAction.message.id,
            }),
        );
        removeMessageForAction();
    }, [dispatch, messageForAction, removeMessageForAction, room]);

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
        console.log("response: ", response);
        // const buffer = await record.arrayBuffer();
        // const attachment: IAttachment = {
        //     originalName: "",
        //     fileType: FileType.VOICE_RECORD,
        //     mimeType: "audio/webm",
        //     extension: "webm",
        //     buffer: buffer,
        // };

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
            <Layout>
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
                                        ).length + 1}{" "}
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
                    <div className="active-room__space"></div>
                    <div className="active-room__options">
                        <PhoneOutlined
                            onClick={onInitCall}
                            className="custom"
                        />
                        <MenuFoldOutlined className="custom" />
                    </div>
                </Header>

                {room.pinnedMessages && room.pinnedMessages.length > 0 && (
                    <PinnedMessages pinnedMessages={room.pinnedMessages} />
                )}

                <RoomContent
                    className="active-room__content"
                    ref={refChatContent}
                    user={user}
                    room={room}
                    isNeedScrollToLastMessage={isNeedScrollToLastMessage}
                    onChooseMessageForAction={onChooseMessageForAction}
                    onOpenUsersListForForwardMessage={openModalToForwardMessage}
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

                <Modal
                    title="Вы хотите удалить сообщение?"
                    onCancel={removeMessageForAction}
                    onOk={onDeleteMessage}
                    open={
                        !!(
                            messageForAction &&
                            messageForAction.action === MessageAction.DELETE
                        )
                    }
                >
                    {room.type === RoomType.PRIVATE &&
                    messageForAction &&
                    messageForAction.action === MessageAction.DELETE &&
                    messageForAction.message.senderId === user.id ? (
                        <Checkbox
                            checked={messageForAction.isForEveryone}
                            onChange={(event) => {
                                setMessageForAction({
                                    message: messageForAction.message,
                                    action: MessageAction.DELETE,
                                    isForEveryone: event.target.checked,
                                });
                            }}
                        >
                            <Text>Удалить у всех</Text>
                        </Checkbox>
                    ) : messageForAction &&
                      messageForAction.action === MessageAction.DELETE &&
                      messageForAction.isForEveryone ? (
                        <Text>Сообщение будет удалено у всех в этом чате.</Text>
                    ) : (
                        <Text>Сообщение будет удалено только у вас.</Text>
                    )}
                </Modal>

                <Modal
                    title="Вы хотели бы закрепить сообщение?"
                    onCancel={removeMessageForAction}
                    onOk={onPinMessage}
                    open={
                        !!(
                            messageForAction &&
                            messageForAction.action === MessageAction.PIN
                        )
                    }
                />
            </Layout>
        </ConfigProvider>
    );
};

export default ActiveRoom;
