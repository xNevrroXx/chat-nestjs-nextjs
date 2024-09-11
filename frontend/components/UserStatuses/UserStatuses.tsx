import React from "react";
import { Flex, theme, Typography } from "antd";
import { RoomType } from "@/models/room/IRoom.store";
import {
    IUseUserStatuses,
    useUserStatuses,
} from "@/hooks/useUserStatuses.hook";

const { useToken } = theme;
const { Text } = Typography;

interface IProps extends IUseUserStatuses {}

const UserStatuses = ({
    roomType,
    participants,
    interlocutor,
    userId,
}: IProps) => {
    const { token } = useToken();
    const { numberParticipantsInfo, otherInfo } = useUserStatuses({
        userId,
        roomType,
        interlocutor,
        participants,
    });

    return (
        <Flex gap={"small"}>
            {roomType === RoomType.GROUP && (
                <Text
                    style={{
                        color: token.colorTextDisabled,
                    }}
                    className="active-room__status"
                >
                    {numberParticipantsInfo}
                </Text>
            )}
            <Text
                style={{ color: token.colorTextDisabled }}
                className="active-room__status"
            >
                {otherInfo}
            </Text>
        </Flex>
    );
};

export default UserStatuses;
