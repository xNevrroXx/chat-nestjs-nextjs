import React, { FC } from "react";
// own modules
import DialogCard from "@/components/DialogCard/DialogCard";
// types
import { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";
import { FetchingStatus } from "@/hooks/useFetch.hook";
import { Spinner } from "@/components/Spinner/Spinner";
import { Typography } from "antd";

const { Text } = Typography;

interface IDialogsProps {
    rooms: TPreviewExistingRoom[];
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null;
    onClickRemoteRoom: (room: TPreviewExistingRoom) => void;
    dialogQueryString: string;
    statusFetching: FetchingStatus;
}

const ListRemoteDialogs: FC<IDialogsProps> = ({
    rooms,
    onClickRemoteRoom,
    activeRoomId,
    dialogQueryString,
    statusFetching,
}) => {
    if (dialogQueryString && statusFetching === FetchingStatus.FETCHING) {
        return (
            <div className={"dialogs__pl"} key={"remote dialogs spinner"}>
                <Spinner />
            </div>
        );
    }

    if (statusFetching === FetchingStatus.FULFILLED && rooms.length === 0) {
        return (
            <Text className={"dialogs__pl"} key={"remote dialogs not found"}>
                Не найдены
            </Text>
        );
    }

    return (
        <ul className="dialogs__list">
            {rooms.map((room) => (
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
            ))}
        </ul>
    );
};

export default ListRemoteDialogs;
