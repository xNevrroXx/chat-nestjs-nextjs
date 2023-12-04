import {FC, useMemo} from "react";
// own modules
import DialogCard from "@/components/DialogCard/DialogCard";
// types
import {IRoom, TTemporarilyRoomOrUserBySearch} from "@/models/IStore/IRoom";
import {TValueOf} from "@/models/TUtils";
import {IUserDto} from "@/models/IStore/IAuthentication";
// styles


interface IDialogsProps {
    user: IUserDto,
    rooms: TTemporarilyRoomOrUserBySearch[],
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null,
    onCreateNewDialog: (room: TTemporarilyRoomOrUserBySearch) => void,
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
