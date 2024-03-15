import React, { FC, MutableRefObject, useMemo } from "react";
import {
    IForwardedMessage,
    IForwardMessage,
    IMessage,
    RoomType,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
import { TMessageForAction } from "@/models/room/IRoom.general";
import Message, { TPaddings } from "@/HOC/Message";
import { Avatar } from "antd";
import { getNameInitials } from "@/utils/getNameInitials";
// styles
import "./messages-by-user.scss";
import { useAppSelector } from "@/hooks/store.hook";
import { messageOwnerSelector } from "@/store/selectors/messageOwner.selector";

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
    hasLastLargePadding: boolean;
    messagesByUserId: string;
};

const MessagesByUser: FC<TProps> = ({
    userId,
    messages,
    onChooseMessageForAction,
    onOpenUsersListForForwardMessage,
    roomType,
    messageRefs,
    hasLastLargePadding = false,
    messagesByUserId,
}) => {
    const user = useAppSelector((state) =>
        messageOwnerSelector(state, messagesByUserId),
    );

    const messageElems = useMemo(() => {
        return messages.map((message, index, messages) => {
            if (message.isDeleted) {
                return;
            }

            const currentCreatedAt = new Date(message.createdAt);
            const next = messages[index + 1];

            const paddings: TPaddings = {
                bottom: "small",
            };

            const min = 1000 * 60; // 1 minute in milliseconds

            if (next) {
                const nextCreatedAt = new Date(next.createdAt);

                if (
                    nextCreatedAt.getTime() - currentCreatedAt.getTime() >
                    min * 10
                ) {
                    // if more than 10 minutes have past
                    paddings.bottom = "large";
                }
            }
            else if (hasLastLargePadding) {
                paddings.bottom = "large";
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
                    shouldSpecifyAuthor={
                        roomType === RoomType.GROUP &&
                        index === 0 &&
                        user && {
                            color: user.color,
                            displayName: user.displayName,
                        }
                    }
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
    }, [
        messageRefs,
        messages,
        onChooseMessageForAction,
        onOpenUsersListForForwardMessage,
        roomType,
        userId,
    ]);

    return (
        <div className={"block-by-user"}>
            <div className={"block-by-day__messages"}>{messageElems}</div>
            <div
                style={{
                    position: "absolute",
                    bottom: "1px",
                    paddingLeft: "14px",
                }}
            >
                <Avatar
                    size={30}
                    style={{ fontSize: "13px", backgroundColor: user!.color }}
                >
                    {getNameInitials({
                        name: (user && user.displayName) || "",
                    })}
                </Avatar>
            </div>
        </div>
    );
};

export default MessagesByUser;
