import { FC, useMemo } from "react";
// own modules
import DialogCard from "@/components/DialogCard/DialogCard";
// types
import { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";
// styles

interface IDialogsProps {
    user: IUserDto;
    rooms: TPreviewExistingRoom[];
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null;
    onClickRemoteRoom: (room: TPreviewExistingRoom) => void;
}

const ListRemoteDialogs: FC<IDialogsProps> = ({
    rooms,
    onClickRemoteRoom,
    activeRoomId,
}) => {
    const list = useMemo(() => {
        return rooms.map((room) => {
            return (
                <DialogCard
                    color={room.color}
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    onClick={() => onClickRemoteRoom(room)}
                    dialogName={room.name}
                    isActive={activeRoomId === room.id}
                    roomType={room.type}
                    lastMessageInfo={null}
                />
            );
        });
    }, [rooms, activeRoomId, onClickRemoteRoom]);

    return <ul className="dialogs__list">{list}</ul>;
};

export default ListRemoteDialogs;
