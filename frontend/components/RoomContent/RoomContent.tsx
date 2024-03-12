import React, {
    forwardRef,
    RefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import classNames from "classnames";
import { Content } from "antd/lib/layout/layout";
// own modules
import MessagesByDay from "@/components/MessagesByDay/MessagesByDay";
import { useAppDispatch } from "@/hooks/store.hook";
import { readMessageSocket } from "@/store/thunks/room";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver.hook";
import { IUserDto } from "@/models/auth/IAuth.store";
import {
    IForwardMessage,
    IRoom,
    TPreviewExistingRoom,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { TMessageForAction } from "@/models/room/IRoom.general";
// styles
import "./room-content.scss";

interface IChatContentProps {
    className?: string;
    user: IUserDto;
    room: IRoom | TPreviewExistingRoom;
    isNeedScrollToLastMessage: RefObject<boolean>;
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void;
    onOpenUsersListForForwardMessage: (
        forwardedMessageId: TValueOf<
            Pick<IForwardMessage, "forwardedMessageId">
        >,
    ) => void;
}

const RoomContent = forwardRef<HTMLDivElement, IChatContentProps>(
    (
        {
            className,
            user,
            room,
            onChooseMessageForAction,
            isNeedScrollToLastMessage,
            onOpenUsersListForForwardMessage,
        },
        outerRef,
    ) => {
        const dispatch = useAppDispatch();
        const messageRefs = useRef<HTMLDivElement[]>([]);

        const onView = useCallback(
            (
                entry: IntersectionObserverEntry,
                observer: IntersectionObserver,
            ) => {
                if (!entry.isIntersecting) {
                    return;
                }
                const elem = entry.target;

                const messageId = elem.id;

                void dispatch(
                    readMessageSocket({
                        roomId: room.id,
                        messageId: messageId,
                    }),
                );

                observer.unobserve(elem);
            },
            [dispatch, room.id],
        );

        const listMessages = useMemo(() => {
            const content: JSX.Element[] = [];
            for (const [date, messages] of Object.entries(room.days)) {
                content.push(
                    <MessagesByDay
                        key={room.id + date}
                        date={date}
                        messages={messages}
                        messageRefs={messageRefs}
                        userId={user.id}
                        onChooseMessageForAction={onChooseMessageForAction}
                        onOpenUsersListForForwardMessage={
                            onOpenUsersListForForwardMessage
                        }
                        roomType={room.type}
                    />,
                );
            }
            return content;
        }, [
            room.days,
            room.id,
            room.type,
            user.id,
            onChooseMessageForAction,
            onOpenUsersListForForwardMessage,
        ]);

        const { rootRef: innerRef } = useIntersectionObserver<HTMLDivElement>(
            {
                threshold: 0.8,
                rootMargin: "0px",
                observedElementRefs: messageRefs,
                onIntersection: onView,
            },
            [listMessages],
        );

        useImperativeHandle(outerRef, () => innerRef.current!, [innerRef]);

        useEffect(() => {
            if (!innerRef.current || !isNeedScrollToLastMessage.current) return;

            innerRef.current.scrollTo(0, innerRef.current.scrollHeight);
        }, [innerRef, isNeedScrollToLastMessage, listMessages]);

        return (
            <Content
                ref={innerRef}
                className={classNames("room-content", className)}
            >
                <div className="room-content__wrapper">{listMessages}</div>
            </Content>
        );
    },
);
RoomContent.displayName = "RoomContent";

export default RoomContent;
