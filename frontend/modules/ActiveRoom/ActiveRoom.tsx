import {
    MenuFoldOutlined,
    PhoneOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import { Button, Flex, Layout, theme, Typography } from "antd";
import React, { type FC, useCallback, useRef, useState } from "react";
// own modules
import { useScrollTrigger } from "@/hooks/useScrollTrigger.hook";
import RoomContent from "@/components/RoomContent/RoomContent";
import ScrollDownButton from "@/components/ScrollDownButton/ScrollDownButton";
import InputMessage from "@/modules/InputMessage/InputMessage";
import type { IUserDto } from "@/models/auth/IAuth.store";
import {
    RoomType,
    TPreviewRoomWithFlag,
    TRoomWithPreviewFlag,
} from "@/models/room/IRoom.store";
import { TMessageForAction } from "@/models/room/IRoom.general";
import PinnedMessages from "../PinnedMessages/PinnedMessages";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
// actions
import { openCallModal } from "@/store/actions/modal-windows";
import { useOnTyping } from "@/hooks/useOnTyping.hook";
import { useUserStatuses } from "@/hooks/useUserStatuses.hook";
import { interlocutorSelector } from "@/store/selectors/interlocutor.selector";
import { useSendMessage } from "@/hooks/useSendMessage.hook";
import {
    addRecentRoomData,
    removeRecentRoomData,
    resetCurrentRoomId,
    updateMessageForAction,
} from "@/store/actions/recent-rooms";
import { joinRoom } from "@/store/thunks/room";
import { TValueOf } from "@/models/TUtils";
import { findMessageForActionSelector } from "@/store/selectors/findMessageForAction.selector";
// styles
import "./active-room.scss";

const { Header, Footer } = Layout;
const { Text, Title } = Typography;

const { useToken } = theme;

interface IActiveChatProps {
    user: IUserDto;
    room: TRoomWithPreviewFlag | TPreviewRoomWithFlag;
}

const ActiveRoom: FC<IActiveChatProps> = ({ user, room }) => {
    const { token } = useToken();
    const dispatch = useAppDispatch();
    const { onTyping, resetDebouncedOnTypingFunction } = useOnTyping({
        roomId: room.id,
        isPreviewRoom: room.isPreview,
    });
    const deviceDimensions = useAppSelector((state) => state.device);
    const interlocutor = useAppSelector((state) =>
        interlocutorSelector(state, room.type, room.participants),
    );
    const userStatuses = useUserStatuses({
        interlocutor,
        roomType: room.type,
        participants: room.participants,
    });
    const messageForAction = useAppSelector((state) =>
        findMessageForActionSelector(state, room.id),
    );
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

    const onCloseRoom = useCallback(() => {
        dispatch(resetCurrentRoomId());
    }, [dispatch]);

    const onJoinRoom = useCallback(
        async (
            roomId: TValueOf<Pick<TPreviewRoomWithFlag, "id">>,
            type: RoomType,
            wasMember?: boolean,
        ) => {
            // activeRoom, probably, is a remote room viewing at this moment.
            try {
                dispatch(removeRecentRoomData(roomId));
                const newRoom = await dispatch(
                    joinRoom({
                        id: roomId,
                        type,
                        wasMember: wasMember || false,
                    }),
                ).unwrap();

                dispatch(
                    addRecentRoomData({
                        id: newRoom.id,
                    }),
                );
                return newRoom;
            }
            catch (rejectedValueOrSerializedError) {
                console.warn(
                    "Error when joining a room!: ",
                    rejectedValueOrSerializedError,
                );
            }
        },
        [dispatch],
    );

    const { sendEditedMessage, sendStandardMessage, sendVoiceMessage } =
        useSendMessage({
            afterSendingCb: () =>
                dispatch(updateMessageForAction({ messageForAction: null })),
            beforeSendingCb: () => resetDebouncedOnTypingFunction(),
            previewInfo: room.isPreview
                ? { isPreview: room.isPreview, wasMember: room.wasMember }
                : { isPreview: room.isPreview },
            roomType: room.type,
            roomId: room.id,
            messageId: messageForAction && messageForAction.message.id,
            onJoinRoom: onJoinRoom,
        });

    const onInitCall = useCallback(() => {
        if (room.isPreview) {
            return;
        }

        dispatch(openCallModal({ roomId: room.id }));
    }, [dispatch, room]);

    const onClickScrollButton = () => {
        if (!refChatContent.current) {
            return;
        }

        refChatContent.current.scrollTo(0, refChatContent.current.scrollHeight);
    };

    const onChooseMessageForAction = useCallback(
        (messageForAction: TMessageForAction | null) => {
            dispatch(updateMessageForAction({ messageForAction }));
        },
        [dispatch],
    );

    return (
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
                                    ).length + (room.isPreview ? 0 : 1)}{" "}
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
                    {!room.isPreview && (
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

                {room && room.isPreview && room.type === RoomType.GROUP ? (
                    <Button
                        onClick={() =>
                            onJoinRoom(room.id, room.type, room.wasMember)
                        }
                        block
                        style={{ marginBottom: "10px" }}
                    >
                        Вступить в группу
                    </Button>
                ) : (
                    <InputMessage
                        changeMessageForAction={onChooseMessageForAction}
                        messageForAction={messageForAction}
                        removeMessageForAction={() =>
                            dispatch(
                                updateMessageForAction({
                                    messageForAction: null,
                                }),
                            )
                        }
                        onTyping={onTyping}
                        onSendMessage={sendStandardMessage}
                        onSendVoiceMessage={sendVoiceMessage}
                        onSendEditedMessage={sendEditedMessage}
                    />
                )}
            </Footer>
        </Layout>
    );
};

export default ActiveRoom;
