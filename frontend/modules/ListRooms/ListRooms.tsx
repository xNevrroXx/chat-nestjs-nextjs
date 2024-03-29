import React, { FC, useMemo } from "react";
// own modules
import RoomCard from "@/components/RoomCard/RoomCard";
import { IRoom } from "@/models/room/IRoom.store";

interface IRoomsProps {
    rooms: IRoom[];
    onClickRoom: (room: IRoom) => void;
}

const ListRooms: FC<IRoomsProps> = ({ rooms, onClickRoom }) => {
    const list = useMemo(() => {
        return rooms.map((room) => (
            <RoomCard
                key={room.id}
                room={room}
                onClick={() => onClickRoom(room)}
            />
        ));
    }, [rooms, onClickRoom]);

    return <ul className="rooms__list">{list}</ul>;
};

export default ListRooms;
