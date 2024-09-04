"use client";

import React, { FC, useEffect } from "react";
import {
    MinusOutlined,
    PhoneFilled,
    VideoCameraFilled,
} from "@ant-design/icons";
import { Avatar, Modal, theme } from "antd";
import { useWebRTC } from "@/hooks/useWebRTC.hook";
// styles
import "./call.scss";

const { useToken } = theme;

interface ICallProps {
    roomId: string;
    isCalling: boolean;
    onHangUp: () => void;
    onInitCall: () => void;
}
const Call: FC<ICallProps> = ({ roomId, onHangUp, isCalling, onInitCall }) => {
    const { clients, provideMediaRef, hangUp, startCall } = useWebRTC(roomId);
    const { token } = useToken();

    useEffect(() => {
        if (!isCalling) {
            return;
        }

        startCall();
    }, [isCalling, startCall]);

    return (
        <Modal
            className={"call"}
            // title={"Звонок"}
            // closable={false}
            open={isCalling}
            closeIcon={<MinusOutlined title={"Свернуть"} />}
            cancelButtonProps={{ style: { display: "none" } }}
            okButtonProps={{ style: { display: "none" } }}
            styles={{
                content: { padding: 0 },
                body: { padding: "20px 24px" },
                footer: { padding: "0 20px 24px 20px" },
            }}
            footer={
                <div className={"call__actions"}>
                    <div />
                    <button
                        onClick={() => {
                            hangUp();
                            onHangUp();
                        }}
                        className={"call__decline-btn"}
                    >
                        <PhoneFilled rotate={-135} />
                    </button>

                    <button onClick={() => {}}>
                        <VideoCameraFilled
                            style={{ color: token.colorTextSecondary }}
                        />
                    </button>
                </div>
            }
        >
            <Avatar size={52}></Avatar>
            <div className={"call__participants"}>
                {clients.map((client) => {
                    return (
                        <div key={client}>
                            <video
                                autoPlay
                                disablePictureInPicture
                                playsInline
                                id={client}
                                ref={(ref) => provideMediaRef(client, ref!)}
                            />
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default Call;
