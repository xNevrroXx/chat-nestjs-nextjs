import { FC, useState } from "react";
import classNames from "classnames";
import { Typography, theme } from "antd";
// own modules
import DoubleCheck from "@/icons/DoubleCheck";
import Check from "@/icons/Check";
// styles
import "./time.scss";
import { normalizeDate } from "@/utils/normalizeDate";

const { useToken } = theme;
const { Text } = Typography;

interface ITimeProps {
    createdAt: string;
    hasRead: boolean;
    hasEdited: boolean;
    isMessageEmpty?: boolean;
}
const Time: FC<ITimeProps> = ({
    createdAt,
    hasEdited,
    hasRead,
    isMessageEmpty = false,
}) => {
    const [normalizedCreatedDate] = useState<string>(normalizeDate(createdAt));
    const { token } = useToken();

    return (
        <Text
            style={{
                color: isMessageEmpty ? "white" : token.colorTextSecondary,
            }}
            className={classNames(
                "message__time",
                "time",
                isMessageEmpty && "time_on-attachment",
            )}
        >
            {hasEdited && <i className="time-edited time__part">изменено</i>}
            <span>{normalizedCreatedDate}</span>
            {hasRead ? (
                <span>
                    <DoubleCheck />
                </span>
            ) : (
                <span>
                    <Check />
                </span>
            )}
            <div className="time__inner" title={normalizedCreatedDate}>
                {hasEdited && (
                    <i className="time-edited time__part">изменено</i>
                )}
                <span>{normalizedCreatedDate}</span>
                {hasRead ? (
                    <span>
                        <DoubleCheck />
                    </span>
                ) : (
                    <span>
                        <Check />
                    </span>
                )}
            </div>
        </Text>
    );
};

export default Time;
