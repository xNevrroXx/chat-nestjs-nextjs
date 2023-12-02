import React, {FC} from "react";
import {Badge, Button} from "antd";
import {DownOutlined} from "@ant-design/icons";
// styles
import "./scroll-button.scss";

interface IScrollDownButtonProps {
    amountUnreadMessages: number,
    onClick: () => void
}
const ScrollDownButton: FC<IScrollDownButtonProps> = ({amountUnreadMessages = 0, onClick}) => {


    return (
        <Badge
            className="scroll-button"
            count={amountUnreadMessages}
        >
            <Button
                icon={<DownOutlined/>}
                type="text"
                shape="circle"
                onClick={onClick}
            />
        </Badge>
    );
};

export default ScrollDownButton;