import { FC, useCallback, useMemo } from "react";
// own modules
import DialogCard from "@/components/DialogCard/DialogCard";
// types
import {
    IRoom,
    checkIsStandardMessage,
    IInnerStandardMessage,
    IInnerForwardedMessage,
} from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
import { ILastMessageInfo } from "@/models/room/IRoom.general";

// styles

interface IDialogsProps {
    user: IUserDto;
    rooms: IRoom[];
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null;
    onClickDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void;
    hasDropdown?: boolean;
}

const ListLocalDialogs: FC<IDialogsProps> = ({
    user,
    rooms,
    onClickDialog,
    activeRoomId,
    hasDropdown = false,
}) => {
    const findLastMessageInfo = useCallback(
        (room: IRoom): ILastMessageInfo | null => {
            // find the last non-deleted message in the room
            let lastMessage:
                | IInnerStandardMessage
                | IInnerForwardedMessage
                | undefined = undefined;
            let text: string | undefined = undefined;
            let sender: string = "Unknown";
            let hasUnreadMessage: boolean = false;

            const dates = Object.keys(room.days);

            if (dates.length === 0) {
                return null;
            }

            for (let i = dates.length - 1; i >= 0; i--) {
                const date = dates[i];

                for (let j = room.days[date].length - 1; j >= 0; j--) {
                    lastMessage = room.days[date][j];
                    if (lastMessage.isDeleted) {
                        continue;
                    }
                    if (!hasUnreadMessage && !lastMessage.hasRead) {
                        hasUnreadMessage = true;
                    }

                    if (lastMessage.senderId === user.id) {
                        sender = "Вы";
                    }
                    else {
                        const thirdPartySender = room.participants.find(
                            (participant) =>
                                participant.userId === lastMessage!.senderId,
                        );

                        sender = thirdPartySender
                            ? thirdPartySender.displayName
                            : sender;
                    }

                    if (!lastMessage.text) {
                        if (checkIsStandardMessage(lastMessage)) {
                            text =
                                "вложения - " +
                                lastMessage.files.length.toString();
                        }
                        text = "пересланное сообщение";
                    }
                    else {
                        text = lastMessage.text;
                    }
                    break;
                }

                if (text) {
                    break;
                }
            }

            if (!text || !lastMessage) {
                return null;
            }

            return {
                text,
                sender,
                hasRead: !hasUnreadMessage,
            };
        },
        [user],
    );

    const list = useMemo(() => {
        return rooms.map((room) => {
            const lastMessageInfo = findLastMessageInfo(room);

            return (
                <DialogCard
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    color={room.color}
                    onClick={() => onClickDialog(room.id)}
                    dialogName={room.name}
                    isActive={activeRoomId === room.id}
                    lastMessageInfo={lastMessageInfo}
                    roomType={room.type}
                    hasDropdown={hasDropdown}
                />
            );
        });
    }, [rooms, findLastMessageInfo, activeRoomId, hasDropdown, onClickDialog]);

    return <ul className="dialogs__list">{list}</ul>;
};

export default ListLocalDialogs;
