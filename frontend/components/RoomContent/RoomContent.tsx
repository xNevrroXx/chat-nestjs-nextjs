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
import MessagesByDay from "@/components/MessagesByDay/MessagesByDay";

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
            if (!room.days) {
                return null;
            }

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
                // content.push(
                //     <div>
                //         <div
                //             style={{
                //                 padding: "4px 0 4px 0",
                //                 display: "flex",
                //                 justifyContent: "flex-start",
                //                 alignItems: "center",
                //             }}
                //         >
                //             <div style={{ flexBasis: "17%" }} />
                //             <span
                //                 style={{
                //                     color: "white",
                //                     padding: "5px 15px",
                //                     background: "#1e2c3a",
                //                     borderRadius: "20px",
                //                 }}
                //             >
                //                 {normalizeDate("auto date", date)}
                //             </span>
                //         </div>
                //         <div>
                //             {messages.map((message, index, messages) => {
                //                 if (message.isDeleted) return;
                //
                //                 const currentCreatedAt = new Date(
                //                     message.createdAt,
                //                 );
                //                 const next = messages[index + 1];
                //
                //                 const paddings: TPaddings = {
                //                     bottom: "small",
                //                 };
                //
                //                 const min = 1000 * 60; // 1 minute in milliseconds
                //
                //                 if (next) {
                //                     const nextCreatedAt = new Date(
                //                         next.createdAt,
                //                     );
                //
                //                     if (
                //                         next.senderId !== message.senderId ||
                //                         nextCreatedAt.getTime() -
                //                             currentCreatedAt.getTime() >
                //                             min * 10
                //                     ) {
                //                         // if more than 10 minutes have past or the sender of the next message does not match the sender of the current message
                //                         paddings.bottom = "large";
                //                     }
                //                 }
                //
                //                 messageRefs.current = [];
                //                 return (
                //                     <Message
                //                         ref={(ref) => {
                //                             if (
                //                                 message.senderId !== user.id &&
                //                                 !messageRefs.current.includes(
                //                                     ref!,
                //                                 ) &&
                //                                 !message.hasRead
                //                             ) {
                //                                 messageRefs.current.push(ref!);
                //                             }
                //                         }}
                //                         paddings={paddings}
                //                         key={message.id}
                //                         roomType={room.type}
                //                         userId={user.id}
                //                         message={message}
                //                         onChooseMessageForAction={
                //                             onChooseMessageForAction
                //                         }
                //                         onChooseMessageForForward={() =>
                //                             onOpenUsersListForForwardMessage(
                //                                 message.id,
                //                             )
                //                         }
                //                     />
                //                 );
                //             })}
                //         </div>
                //     </div>,
                // );
            }
            return content;
        }, [
            room.days,
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
