import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Avatar, Checkbox, Flex, Modal, theme, Typography} from "antd";
import React, {type FC, Fragment, useCallback, useMemo, useRef, useState} from "react";
// own modules
import {useScrollTrigger} from "@/hooks/useScrollTrigger.hook";
import RoomContent from "@/components/RoomContent/RoomContent";
import InputMessage from "@/modules/InputMessage/InputMessage";
import ScrollDownButton from "@/components/ScrollDownButton/ScrollDownButton";
import type {IUserDto} from "@/models/IStore/IAuthentication";
import type {TValueOf} from "@/models/TUtils";
import {
    FileType,
    IAttachment,
    IEditMessage,
    IForwardMessage,
    IRoom,
    RoomType,
    TSendMessage
} from "@/models/IStore/IRoom";
import {MessageAction, TMessageForAction} from "@/models/IRoom";
import PinnedMessages from "../PinnedMessages/PinnedMessages";
// actions
import {useAppDispatch, useAppSelector} from "@/hooks/store.hook";
import {
    deleteMessageSocket,
    editMessageSocket,
    pinMessageSocket,
    sendMessageSocket,
    toggleUserTypingSocket
} from "@/store/thunks/room";
import {truncateTheText} from "@/utils/truncateTheText";
// styles
import "./active-room.scss";

const {useToken} = theme;
const {Text, Title} = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: IRoom | null
    openUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void;
}

const ActiveRoom: FC<IActiveChatProps> = ({user, room, openUsersListForForwardMessage}) => {
    const {token} = useToken();
    const dispatch = useAppDispatch();
    const typingTimoutRef = useRef<NodeJS.Timeout | null>(null);
    const interlocutor = useAppSelector(state => {
        if (!room || room.type === RoomType.GROUP) return;
        return state.users.users.find(user => user.id === room.participants[0].userId);
    });
    const [messageForAction, setMessageForAction] = useState<TMessageForAction | null>(null);
    const [isVisibleScrollButtonState, setIsVisibleScrollButtonState] = useState<boolean>(true);
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
        breakpointPx: 350
    });

    const onClickScrollButton = () => {
        if (!refChatContent.current) return;

        refChatContent.current.scrollTo(0, refChatContent.current?.scrollHeight);
    };

    const onChooseMessageForAction = useCallback((messageForAction: TMessageForAction) => {
        setMessageForAction(messageForAction);
    }, []);

    const removeMessageForAction = useCallback(() => {
        setMessageForAction(null);
    }, []);

    const onTyping = useCallback(() => {
        if (!room) return;
        
        if (typingTimoutRef.current) {
            // if the user has recently typed
            clearTimeout(typingTimoutRef.current);

            typingTimoutRef.current = setTimeout(() => {
                void dispatch(
                    toggleUserTypingSocket({
                        roomId: room.id,
                        isTyping: false
                    })
                );
                typingTimoutRef.current = null;
            }, 4000);

            return;
        }

        void dispatch(
            toggleUserTypingSocket({
                roomId: room.id,
                isTyping: true
            })
        );

        typingTimoutRef.current = setTimeout(() => {
            void dispatch(
                toggleUserTypingSocket({
                    roomId: room.id,
                    isTyping: false
                })
            );
            typingTimoutRef.current = null;
        }, 4000);
    }, [dispatch, room]); // todo: need fix, because during the change the active room - the typing status will not change back

    const onDeleteMessage = () => {
        if (!messageForAction || messageForAction.action !== MessageAction.DELETE) return;

        void dispatch(deleteMessageSocket({
                messageId: messageForAction.message.id,
                isForEveryone: messageForAction.isForEveryone
            })
        );
        removeMessageForAction();
    };

    const onPinMessage = useCallback(() => {
        if (!room || !messageForAction || messageForAction.action !== MessageAction.PIN) return;

        void dispatch(pinMessageSocket({
                roomId: room.id,
                messageId: messageForAction.message.id
            })
        );
        removeMessageForAction();
    }, [dispatch, messageForAction, removeMessageForAction, room]);

    const onSendEditedMessage = (text: TValueOf<Pick<IEditMessage, "text">>) => {
        if (!messageForAction || messageForAction.action !== MessageAction.EDIT) return;

        void dispatch(editMessageSocket({
                messageId: messageForAction.message.id,
                text: text
            })
        );
        removeMessageForAction();
    };

    const onSendMessage = useCallback((text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => {
        if (!room) return;

        const message: TSendMessage = {
            roomId: room.id,
            text,
            attachments,
            replyToMessageId: messageForAction && messageForAction.action === MessageAction.REPLY ? messageForAction.message.id : null
        };

        if (typingTimoutRef.current) {
            clearTimeout(typingTimoutRef.current);
            typingTimoutRef.current = null;
        }
        void dispatch(sendMessageSocket(message));
        removeMessageForAction();
    }, [dispatch, room, messageForAction, removeMessageForAction]);

    const sendVoiceMessage = async (record: Blob) => {
        const buffer = await record.arrayBuffer();
        const attachment: IAttachment = {
            originalName: "",
            fileType: FileType.VOICE_RECORD,
            mimeType: "audio/webm",
            extension: "webm",
            buffer: buffer
        };

        onSendMessage(null, [attachment]);
    };

    const userStatuses: string = useMemo(() => {
        if (!room || !room.participants || room.participants.length === 0) {
            return "";
        }

        switch (room.type) {
            case RoomType.PRIVATE: {
                if (!interlocutor || !interlocutor.userOnline.isOnline) {
                    return "Не в сети";
                } else if (room.participants[0].isTyping) {
                    return "Печатает...";
                }
                return "В сети";
            }
            case RoomType.GROUP: {
                const typingUsersText = room.participants
                    .filter(participant => participant.isTyping)
                    .map(participant => participant.nickname + "...")
                    .join(" ");

                return truncateTheText({
                    text: typingUsersText,
                    maxLength: 50
                });
            }
        }
    }, [room, interlocutor]);

    const content = (): JSX.Element => {
        if (!room) {
            return (
                <Flex
                    className="active-room__not-exist"
                    justify="center"
                    align="center"
                >
                    <Title level={5} style={{color: token.colorTextSecondary}}>Выберите чат</Title>
                </Flex>
            );
        }

        return (
            <Fragment>
                <div className="active-room__header">
                    <div className="active-room__info">
                        <Avatar size={36} className="active-room__photo">{/*photo*/}</Avatar>
                        <div className="active-room__wrapper">
                            <Title
                                level={5}
                                className="active-room__name"
                            >
                                {room.name}
                            </Title>
                            <Text style={{color: token.colorTextDisabled}} className="active-room__status">{userStatuses}</Text>
                        </div>
                    </div>
                    <div className="active-room__space"></div>
                    <div className="active-room__options">
                        <PhoneTwoTone/>
                        <MenuFoldOutlined/>
                    </div>
                </div>

                { room.pinnedMessages.length > 0 &&
                    <PinnedMessages pinnedMessages={room.pinnedMessages}/>
                }
                
                <RoomContent
                    className="active-room__content"
                    ref={refChatContent}
                    user={user}
                    room={room}
                    isNeedScrollToLastMessage={isNeedScrollToLastMessage}
                    onChooseMessageForAction={onChooseMessageForAction}
                    onOpenUsersListForForwardMessage={openUsersListForForwardMessage}
                />

                <div className="active-room__footer">
                    {isVisibleScrollButtonState &&
                        <ScrollDownButton
                            onClick={onClickScrollButton}
                            amountUnreadMessages={0}
                        />
                    }
                    <InputMessage
                        messageForEdit={messageForAction && messageForAction.action === MessageAction.EDIT ? messageForAction.message : null}
                        messageForReply={messageForAction && messageForAction.action === MessageAction.REPLY ? messageForAction.message : null}
                        removeMessageForAction={removeMessageForAction}
                        onTyping={onTyping}
                        onSendMessage={onSendMessage}
                        onSendVoiceMessage={sendVoiceMessage}
                        onSendEditedMessage={onSendEditedMessage}
                    />
                </div>

                <Modal
                    title="Вы хотите удалить сообщение?"
                    onCancel={removeMessageForAction}
                    onOk={onDeleteMessage}
                    open={!!(messageForAction && messageForAction.action === MessageAction.DELETE)}
                >
                    {room.type === RoomType.PRIVATE && messageForAction && messageForAction.action === MessageAction.DELETE && messageForAction.message.senderId === user.id
                        ?
                        <Checkbox
                            checked={messageForAction.isForEveryone}
                            onChange={event => {
                                setMessageForAction({
                                    message: messageForAction.message,
                                    action: MessageAction.DELETE,
                                    isForEveryone: event.target.checked
                                });
                            }}
                        >
                            <Text>Удалить у всех</Text>
                        </Checkbox>
                        :
                        room.type === RoomType.PRIVATE
                            ? <Text>Сообщение будет удалено только у вас.</Text>
                            : <Text>Сообщение будет удалено у всех в этом чате.</Text>
                    }
                </Modal>

                <Modal
                    title="Вы хотели бы закрепить сообщение?"
                    onCancel={removeMessageForAction}
                    onOk={onPinMessage}
                    open={!!(messageForAction && messageForAction.action === MessageAction.PIN)}
                />
            </Fragment>
        );
    };

    return (
        <div className="active-room">
            {content()}
        </div>
    );
};

export default ActiveRoom;