import React, { FC } from "react";
import classNames from "classnames";
import { Avatar, Typography } from "antd";
// own modules
import { useAppSelector } from "@/hooks/store.hook";
import { IRoom, RoomType } from "@/models/room/IRoom.store";
import { getNameInitials } from "@/utils/getNameInitials";
import { findInterlocutorSelector } from "@/store/selectors/findInterlocutor.selector";
// styles
import "./room-card.scss";

const { Title, Text } = Typography;

interface IUserCardProps {
    room: IRoom;
    onClick: () => void;
}

const RoomCard: FC<IUserCardProps> = ({ room, onClick }) => {
    const interlocutor = useAppSelector((state) =>
        findInterlocutorSelector(state, room.type, room.participants),
    );

    return (
        <li tabIndex={0} onClick={onClick} className={classNames("room-card")}>
            <div className="room-card__left">
                <Avatar size={48} className="room-card__photo">
                    {getNameInitials({
                        name: room.name,
                    })}
                </Avatar>
            </div>
            <div className="room-card__right">
                <Title level={5} style={{ margin: 0 }}>
                    {room.name}
                </Title>
                <Text>
                    {room.type === RoomType.GROUP
                        ? "Группа"
                        : interlocutor &&
                            !interlocutor.isDeleted &&
                            interlocutor.userOnline.isOnline
                          ? "В сети"
                          : "Не в сети"}
                </Text>
            </div>
        </li>
    );
};

export default RoomCard;
