import {FC, useCallback, useMemo} from "react";
// own modules
import DialogCard from "../DialogCard/DialogCard.tsx";
// types
import {checkIsMessage, IForwardedMessage, IMessage, IRoom} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {ILastMessageInfo} from "../../models/IRoom.ts";
// styles

interface IDialogsProps {
    user: IUserDto,
    rooms: IRoom[],
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null,
    onClickDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void,
}

const ListLocalDialogs: FC<IDialogsProps> = ({user, rooms, onClickDialog, activeRoomId}) => {
    const findLastMessageInfo = useCallback((room: IRoom): ILastMessageInfo | null => {
        let lastMessage: IMessage | IForwardedMessage | undefined = undefined;
        let sender: string | undefined = undefined;
        let text: string | undefined = undefined;
        // find last non-deleted message in the room
        for (let length = room.messages.length,  i = 0; i <= length - 1; i++) {
            lastMessage = room.messages[i];
            if (lastMessage.isDeleted) {
                continue;
            }

            sender = lastMessage.senderId === user.id
                ? "Вы"
                : room.participants.find(participant => participant.userId === lastMessage!.senderId)!.nickname;
            if (!lastMessage.text) {
                if (checkIsMessage(lastMessage)) {
                    text = "вложения - " + lastMessage.files.length.toString();
                }
                text = "пересланное сообщение";
            }
            else {
                text = lastMessage.text;
            }
        }
        if (!sender || !text || !lastMessage) {
            return null;
        }

        return {
            text,
            sender,
            hasRead: lastMessage.hasRead
        };
    }, [user]);

    const list = useMemo(() => {
        return rooms.map(room => {
            const lastMessageInfo = findLastMessageInfo(room);

            return (
                <DialogCard
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    onClick={() => onClickDialog(room.id)}
                    dialogName={room.name}
                    isActive={activeRoomId === room.id}
                    lastMessageInfo={lastMessageInfo}
                    roomType={room.type}
                />
            );
        });
    }, [rooms, activeRoomId, onClickDialog, findLastMessageInfo]);

    return (
        <ul className="dialogs__list">
            {list}
        </ul>
    );
};

export default ListLocalDialogs;