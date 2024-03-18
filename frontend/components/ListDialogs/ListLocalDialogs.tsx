import { FC, useCallback, useMemo } from "react";
// own modules
import DialogCard from "@/components/DialogCard/DialogCard";
// types
import {
    checkIsMessage,
    IForwardedMessage,
    IMessage,
    IRoom,
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
            let lastMessage: IMessage | IForwardedMessage | undefined =
                undefined;
            let sender: string | undefined = undefined;
            let text: string | undefined = undefined;
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

                    sender =
                        lastMessage.senderId === user.id
                            ? "Вы"
                            : room.participants.find(
                                  (participant) =>
                                      participant.userId ===
                                      lastMessage!.senderId,
                              )!.nickname;

                    if (!lastMessage.text) {
                        if (checkIsMessage(lastMessage)) {
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

            if (!sender || !text || !lastMessage) {
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
