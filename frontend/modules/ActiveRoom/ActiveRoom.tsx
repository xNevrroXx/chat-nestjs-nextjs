import { LeftOutlined, PhoneOutlined } from "@ant-design/icons";
import { Button, Layout, Typography } from "antd";
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
import PinnedMessages from "../PinnedMessages/PinnedMessages";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
// actions
import { findInterlocutorSelector } from "@/store/selectors/findInterlocutor.selector";
import { resetCurrentRoomId } from "@/store/actions/recent-rooms";
import { TValueOf } from "@/models/TUtils";
// styles
import "./active-room.scss";
import UserStatuses from "@/components/UserStatuses/UserStatuses";
import { joinRoomAndSetActive } from "@/store/thunks/recent-rooms";
import { openModalWithRoomId } from "@/store/actions/modal-windows";

const { Header, Footer } = Layout;
const { Title } = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: TRoomWithPreviewFlag | TPreviewRoomWithFlag;
}

const ActiveRoom: FC<IActiveChatProps> = ({ user, room }) => {
    const dispatch = useAppDispatch();
    const deviceDimensions = useAppSelector((state) => state.device);
    const interlocutor = useAppSelector((state) =>
        findInterlocutorSelector(state, room.type, room.participants),
    );
    const [isVisibleScrollButtonState, setIsVisibleScrollButtonState] =
        useState<boolean>(true);
    // Indicates when a message is received, whether to scroll through the list of messages to new ones or not.
    const isNeedScrollToLastMessage = useRef<boolean>(true);
    const refChatContent = useScrollTrigger({
        onIntersectionBreakpoint: {
            toTop: () => {
                /*
                 * 1) When a user scrolls too far from the bottom of the page -
                 * it will turn off automating scrolling down, when receiving a message.
                 *
                 * 2) And the "scroll down" button will be shown.
                 * */
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

    const onJoinAndSetActive = useCallback(
        async (
            roomId: TValueOf<Pick<TPreviewRoomWithFlag, "id">>,
            type: RoomType,
            wasMember?: boolean,
        ) => {
            // activeRoom, probably, is a remote room viewing at this moment.
            return await dispatch(
                joinRoomAndSetActive({
                    id: roomId,
                    type,
                    wasMember: wasMember ? wasMember : false,
                }),
            ).unwrap();
        },
        [dispatch],
    );

    const onInitCall = useCallback(() => {
        if (room.isPreview) {
            return;
        }

        dispatch(
            openModalWithRoomId({
                modalName: "call",
                roomId: room.id,
            }),
        );
    }, [dispatch, room]);

    const onClickScrollButton = () => {
        if (!refChatContent.current) {
            return;
        }

        refChatContent.current.scrollTo(0, refChatContent.current.scrollHeight);
    };

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
                        <UserStatuses
                            userId={user.id}
                            roomType={room.type}
                            interlocutor={interlocutor}
                            participants={room.participants}
                        />
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
                            onJoinAndSetActive(
                                room.id,
                                room.type,
                                room.wasMember,
                            )
                        }
                        block
                        style={{ marginBottom: "10px" }}
                    >
                        Вступить в группу
                    </Button>
                ) : (
                    <InputMessage />
                )}
            </Footer>
        </Layout>
    );
};

export default ActiveRoom;
