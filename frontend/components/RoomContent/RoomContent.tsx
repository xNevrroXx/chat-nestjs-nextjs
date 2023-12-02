import React, {
    forwardRef,
    RefObject,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import classNames from "classnames";
// own modules
import Message from "@/HOC/Message";
import {IUserDto} from "@/models/IStore/IAuthentication";
import {IForwardMessage, IRoom} from "../../models/IStore/IRoom";
import {TValueOf} from "@/models/TUtils";
import {TMessageForAction} from "@/models/IRoom";
// styles
import "./room-content.scss";


interface IChatContentProps {
    className?: string,
    user: IUserDto;
    room: IRoom,
    isNeedScrollToLastMessage: RefObject<boolean>,
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void,
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void
}

const RoomContent = forwardRef<HTMLDivElement, IChatContentProps>(({
                                                                       className,
                                                                       user,
                                                                       room,
                                                                       onChooseMessageForAction,
                                                                       isNeedScrollToLastMessage,
                                                                       onOpenUsersListForForwardMessage
                                                                   }, outerRef) => {
    const innerRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const listMessages = useMemo(() => {
        if (!room.messages) {
            return null;
        }

        return room.messages.map(message => {
            if (message.isDeleted) return;
            return (
                <Message
                    key={message.id}
                    userId={user.id}
                    message={message}
                    onChooseMessageForAction={onChooseMessageForAction}
                    onChooseMessageForForward={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [room.messages, user.id, onChooseMessageForAction, onOpenUsersListForForwardMessage]);

    useEffect(() => {
        if (!innerRef.current || !isNeedScrollToLastMessage.current) return;

        innerRef.current.scrollTo(0, innerRef.current.scrollHeight);
    }, [isNeedScrollToLastMessage, listMessages]);

    return (
        <div
            ref={innerRef}
            className={classNames("room-content", className)}
        >
            <div className="room-content__wrapper">
                {listMessages}
            </div>
        </div>
    );
});

export default RoomContent;