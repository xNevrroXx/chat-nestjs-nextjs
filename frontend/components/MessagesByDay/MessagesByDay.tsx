import React, { FC, MutableRefObject, useMemo } from "react";
import { Typography } from "antd";
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
import MessagesByUser from "@/components/MessagesByUser/MessagesByUser";

const { Text } = Typography;

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
    const messageByUserElems = useMemo(() => {
        const resultElems: JSX.Element[] = [];

        let currentUserId = null;
        let messagesByCurrentUser: (IMessage | IForwardedMessage)[] = [];

        console.log("messages: ", messages);
        for (let i = 0, length = messages.length; i < length; i++) {
            const message = messages[i];

            if (message.isDeleted) {
                continue;
            }

            console.log("is equals: ", currentUserId === message.senderId);
            if (!currentUserId) {
                console.log("1");
                currentUserId = message.senderId;
            }
            else if (currentUserId !== message.senderId) {
                console.log("currentUser: ", currentUserId);
                console.log("message.senderId: ", message.senderId);
                console.log("2: ", "push " + messagesByCurrentUser.length);
                resultElems.push(
                    <MessagesByUser
                        key={date + currentUserId + message.createdAt}
                        date={date}
                        hasLastLargePadding={true}
                        messages={messagesByCurrentUser}
                        userId={userId}
                        messagesByUserId={currentUserId}
                        onChooseMessageForAction={onChooseMessageForAction}
                        onOpenUsersListForForwardMessage={
                            onOpenUsersListForForwardMessage
                        }
                        roomType={roomType}
                        messageRefs={messageRefs}
                    />,
                );

                currentUserId = message.senderId;
                messagesByCurrentUser = [];
            }

            messagesByCurrentUser.push(message);
        }

        messagesByCurrentUser.length > 0 &&
            currentUserId &&
            resultElems.push(
                <MessagesByUser
                    key={
                        date +
                        currentUserId +
                        messages[messages.length - 1].createdAt
                    }
                    date={date}
                    messagesByUserId={currentUserId}
                    hasLastLargePadding={false}
                    messages={messagesByCurrentUser}
                    userId={userId}
                    onChooseMessageForAction={onChooseMessageForAction}
                    onOpenUsersListForForwardMessage={
                        onOpenUsersListForForwardMessage
                    }
                    roomType={roomType}
                    messageRefs={messageRefs}
                />,
            );

        return resultElems;
    }, [
        date,
        messageRefs,
        messages,
        onChooseMessageForAction,
        onOpenUsersListForForwardMessage,
        roomType,
        userId,
    ]);

    return (
        <div className={"block-by-day"}>
            <div className={"block-by-day__date-wrapper"}>
                <div style={{ flexBasis: "17%" }} />
                <div className={"block-by-day__date"}>
                    <Text>{normalizeDate("auto date", date)}</Text>
                </div>
            </div>
            <div className={"block-by-day__messages"}>{messageByUserElems}</div>
        </div>
    );
};

export default MessagesByDay;
