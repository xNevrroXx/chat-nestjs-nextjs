import {FC, useMemo} from "react";
// own modules
import DialogCard from "../DialogCard/DialogCard.tsx";
// types
import {IRoom, TTemporarilyRoomBySearch} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
// styles


interface IDialogsProps {
    user: IUserDto,
    rooms: TTemporarilyRoomBySearch[],
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null,
    onCreateNewDialog: (room: TTemporarilyRoomBySearch) => void,
}

const ListRemoteDialogs: FC<IDialogsProps> = ({rooms, onCreateNewDialog, activeRoomId}) => {

    const list = useMemo(() => {
        return rooms.map(room => {
            return (
                <DialogCard
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    onClick={() => onCreateNewDialog(room)}
                    dialogName={room.name}
                    isActive={activeRoomId === room.id}
                    roomType={room.type}
                    lastMessageInfo={null}
                />
            );
        });
    }, [rooms, activeRoomId, onCreateNewDialog]);

    return (
        <ul className="dialogs__list">
            {list}
        </ul>
    );
};

export default ListRemoteDialogs;