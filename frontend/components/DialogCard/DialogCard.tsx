import React, { FC } from "react";
import { Avatar, Typography } from "antd";
import classNames from "classnames";
import { Markup } from "interweave";
import emojiParser from "universal-emoji-parser";
// own modules
import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom, RoomType } from "@/models/room/IRoom.store";
import { ILastMessageInfo } from "@/models/room/IRoom.general";
import clip from "text-clipper";
import { getNameInitials } from "@/utils/getNameInitials";
// styles
import "./dialog.scss";
import DialogCardDropdown from "@/components/DialogCardDropdown/DialogCardDropdown";

const { Title, Text, Paragraph } = Typography;

interface IDialogCardProps {
    id: TValueOf<Pick<IUserDto, "id">>;
    dialogName: string;
    onClick: () => void;
    isActive: boolean;
    lastMessageInfo: ILastMessageInfo | null;
    roomType: TValueOf<Pick<IRoom, "type">>;
    hasDropdown?: boolean;
}

const DialogCard: FC<IDialogCardProps> = ({
    id,
    dialogName,
    lastMessageInfo,
    onClick,
    isActive,
    roomType,
    hasDropdown = false,
}) => {
    const content = (
        <li
            tabIndex={0}
            data-list-id={id}
            className={classNames("dialog", isActive && "dialog_active")}
            onClick={onClick}
        >
            <div className="dialog__left">
                <Avatar size={48} className="dialog__photo">
                    {getNameInitials({
                        name: dialogName,
                    })}
                </Avatar>
            </div>
            <div className="dialog__right">
                <Title level={5} style={{ margin: 0 }}>
                    {dialogName}
                </Title>
                {lastMessageInfo && (
                    <Paragraph
                        className="dialog__message"
                        style={{ margin: 0 }}
                    >
                        {roomType === RoomType.GROUP && (
                            <Text strong className="dialog__sender-message">
                                {lastMessageInfo.sender + ": "}
                            </Text>
                        )}
                        <Markup
                            noHtml
                            noWrap
                            disableLineBreaks
                            content={emojiParser.parse(
                                clip(lastMessageInfo.text, 50, {
                                    html: true,
                                }),
                            )}
                        />
                    </Paragraph>
                )}
            </div>
            {lastMessageInfo &&
                lastMessageInfo.sender !== "Вы" &&
                !lastMessageInfo.hasRead && (
                    <div className="dialog__message-status">
                        <div className="dialog__not-read"></div>
                    </div>
                )}
        </li>
    );

    if (hasDropdown) {
        return <DialogCardDropdown roomId={id}>{content}</DialogCardDropdown>;
    }

    return content;
};

export default DialogCard;
