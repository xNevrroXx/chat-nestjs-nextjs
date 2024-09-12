import React, { FC, MutableRefObject, useMemo } from "react";
import { Typography } from "antd";
import { normalizeDate } from "@/utils/normalizeDate";
import {
    IInnerForwardedMessage,
    IInnerStandardMessage,
    RoomType,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
import { TMessageForEditOrReply } from "@/models/room/IRoom.general";
import MessagesByUser from "@/components/MessagesByUser/MessagesByUser";
import "./messages-by-day.scss";

const { Text } = Typography;

type TProps = {
    date: string;
    messages: (IInnerStandardMessage | IInnerForwardedMessage)[];
    userId: TValueOf<Pick<IUserDto, "id">>;
    roomType: RoomType;
    messageRefs: MutableRefObject<HTMLDivElement[]>;
};

const MessagesByDay: FC<TProps> = ({
    userId,
    date,
    messages,
    roomType,
    messageRefs,
}) => {
    const messagesByUserElems = useMemo(() => {
        const resultElems: JSX.Element[] = [];

        let currentUserId = null;
        let messagesByCurrentUser: (
            | IInnerStandardMessage
            | IInnerForwardedMessage
        )[] = [];

        for (let i = 0, length = messages.length; i < length; i++) {
            const message = messages[i];

            if (message.isDeleted) {
                continue;
            }

            if (!currentUserId) {
                currentUserId = message.senderId;
            }
            else if (currentUserId !== message.senderId) {
                resultElems.push(
                    <MessagesByUser
                        key={date + currentUserId + message.createdAt}
                        date={date}
                        hasLastLargePadding={true}
                        messages={messagesByCurrentUser}
                        userId={userId}
                        messagesByUserId={currentUserId}
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
                    roomType={roomType}
                    messageRefs={messageRefs}
                />,
            );

        return resultElems;
    }, [date, messageRefs, messages, roomType, userId]);

    if (messagesByUserElems.length === 0) {
        return;
    }

    return (
        <div className={"block-by-day"}>
            <div className={"block-by-day__date-wrapper"}>
                <div />
                <div className={"block-by-day__date"}>
                    <Text>{normalizeDate("auto date", date)}</Text>
                </div>
            </div>
            <div className={"block-by-day__messages"}>
                {messagesByUserElems}
            </div>
        </div>
    );
};

export default MessagesByDay;
