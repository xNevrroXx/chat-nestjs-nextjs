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
import Message from "@/HOC/Message";
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
import { useAppDispatch } from "@/hooks/store.hook";
import { readMessageSocket } from "@/store/thunks/room";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver.hook";

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
            (entry: IntersectionObserverEntry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                const elem = entry.target;

                const messageId = elem.id;
                const isMessageAlreadyRead = room.messages.find(
                    (message) => message.id === messageId,
                )!.hasRead;
                if (isMessageAlreadyRead) {
                    return;
                }

                void dispatch(
                    readMessageSocket({
                        roomId: room.id,
                        messageId: messageId,
                    }),
                );
            },
            [dispatch, room.id, room.messages],
        );

        const { rootRef: innerRef } = useIntersectionObserver<HTMLDivElement>({
            threshold: 0.8,
            rootMargin: "0px",
            observedElementRefs: messageRefs,
            onIntersection: onView,
        });

        useImperativeHandle(outerRef, () => innerRef.current!, [innerRef]);

        const listMessages = useMemo(() => {
            if (!room.messages) {
                return null;
            }

            return room.messages.map((message) => {
                if (message.isDeleted) return;

                messageRefs.current = [];
                return (
                    <Message
                        ref={(ref) => {
                            if (!messageRefs.current.includes(ref!)) {
                                messageRefs.current.push(ref!);
                            }
                        }}
                        key={message.id}
                        roomType={room.type}
                        userId={user.id}
                        message={message}
                        onChooseMessageForAction={onChooseMessageForAction}
                        onChooseMessageForForward={() =>
                            onOpenUsersListForForwardMessage(message.id)
                        }
                    />
                );
            });
        }, [
            room.messages,
            room.type,
            user.id,
            onChooseMessageForAction,
            onOpenUsersListForForwardMessage,
        ]);

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
