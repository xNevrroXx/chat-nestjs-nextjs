import React, { FC, MutableRefObject, RefObject, useMemo } from "react";
import { normalizeDate } from "@/utils/normalizeDate";
import Message, { TPaddings } from "@/HOC/Message";
import {
    IForwardedMessage,
    IForwardMessage,
    IMessage,
    RoomType,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
import "./messages-by-day.scss";
import { TMessageForAction } from "@/models/room/IRoom.general";

type TProps = {
    date: string;
    messages: (IMessage | IForwardedMessage)[];
    userId: TValueOf<Pick<IUserDto, "id">>;
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void;
    onOpenUsersListForForwardMessage: (
        forwardedMessageId: TValueOf<
            Pick<IForwardMessage, "forwardedMessageId">
        >,
    ) => void;
    roomType: RoomType;
    messageRefs: MutableRefObject<HTMLDivElement[]>;
};

const MessagesByDay: FC<TProps> = ({
    userId,
    date,
    messages,
    onChooseMessageForAction,
    onOpenUsersListForForwardMessage,
    roomType,
    messageRefs,
}) => {
    const messageElems = useMemo(() => {
        return messages.map((message, index, messages) => {
            if (message.isDeleted) return;

            const currentCreatedAt = new Date(message.createdAt);
            const next = messages[index + 1];

            const paddings: TPaddings = {
                bottom: "small",
            };

            const min = 1000 * 60; // 1 minute in milliseconds

            if (next) {
                const nextCreatedAt = new Date(next.createdAt);

                if (
                    next.senderId !== message.senderId ||
                    nextCreatedAt.getTime() - currentCreatedAt.getTime() >
                        min * 10
                ) {
                    // if more than 10 minutes have past or the sender of the next message does not match the sender of the current message
                    paddings.bottom = "large";
                }
            }

            messageRefs.current = [];
            return (
                <Message
                    ref={(ref) => {
                        if (
                            message.senderId !== userId &&
                            !messageRefs.current.includes(ref!) &&
                            !message.hasRead
                        ) {
                            messageRefs.current.push(ref!);
                        }
                    }}
                    paddings={paddings}
                    key={message.id}
                    roomType={roomType}
                    userId={userId}
                    message={message}
                    onChooseMessageForAction={onChooseMessageForAction}
                    onChooseMessageForForward={() =>
                        onOpenUsersListForForwardMessage(message.id)
                    }
                />
            );
        });
    }, []);

    return (
        <div className={"block-by-day"}>
            <div className={"block-by-day__date-wrapper"}>
                <div style={{ flexBasis: "17%" }} />
                <div className={"block-by-day__date"}>
                    {normalizeDate("auto date", date)}
                </div>
            </div>
            <div className={"block-by-day__messages"}>{messageElems}</div>
        </div>
    );
};

export default MessagesByDay;
