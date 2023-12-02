import {FC} from "react";
import * as classNames from "classnames";
import {Typography, theme} from "antd";
// own modules
import DoubleCheck from "../../icons/DoubleCheck.tsx";
import Check from "../../icons/Check.tsx";
// styles
import "./time.scss";

const {useToken} = theme;
const {Text} = Typography;

interface ITimeProps {
    createdAt: string,
    hasRead: boolean,
    hasEdited: boolean,
    isMessageEmpty?: boolean
}
const Time: FC<ITimeProps> = ({createdAt, hasEdited, hasRead, isMessageEmpty = false}) => {
    const {token} = useToken();

    return (
        <Text
            style={{color: isMessageEmpty ? "white" : token.colorTextSecondary}}
            className={classNames("message__time", "time")}
        >
            {hasEdited && <i className="time-edited time__part">изменено</i>}
            <span>{createdAt}</span>
             { hasRead
                ? <span><DoubleCheck/></span>
                : <span><Check/></span>
             }
            <div className="time__inner" title={createdAt}>
                {hasEdited && <i className="time-edited time__part">изменено</i>}
                <span>{createdAt}</span>
                { hasRead
                    ? <span><DoubleCheck/></span>
                    : <span><Check/></span>
                }
            </div>
        </Text>
    );
};

export default Time;