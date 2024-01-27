"use client";

import React, { FC } from "react";
import "./call.scss";
import {
    MinusOutlined,
    PhoneFilled,
    VideoCameraFilled,
} from "@ant-design/icons";
import { Avatar, Modal, theme } from "antd";
import { useWebRTC } from "@/hooks/useWebRTC.hook";

const { useToken } = theme;

interface ICallProps {
    roomId: string;
}
const Call: FC<ICallProps> = ({ roomId }) => {
    const { myId, clients, provideMediaRef } = useWebRTC(roomId);
    const { token } = useToken();

    console.log("clients: ", clients);
    return (
        <Modal
            className={"call"}
            // title={"Звонок"}
            // closable={false}
            open
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
                    <button className={"call__decline-btn"}>
                        <PhoneFilled rotate={-135} />
                    </button>

                    <button>
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
                <div>
                    <video
                        draggable="false"
                        autoPlay
                        disablePictureInPicture
                        playsInline
                        id={myId}
                        ref={(ref) => provideMediaRef(myId, ref!)}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default Call;
