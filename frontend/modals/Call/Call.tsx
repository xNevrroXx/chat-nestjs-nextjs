"use client";

import { FC, useCallback, useEffect } from "react";
import { Avatar, Modal, theme } from "antd";
import {
    MinusOutlined,
    PhoneFilled,
    VideoCameraFilled,
} from "@ant-design/icons";
import { useWebRTC } from "@/hooks/useWebRTC.hook";
import { useAppDispatch } from "@/hooks/store.hook";
import { closeModals } from "@/store/actions/modal-windows";
import { IModalWithRoomIdOpened } from "@/models/modal-windows/modal-windows.store";
// styles
import "./call.scss";

const { useToken } = theme;

interface IProps {
    modalInfo: IModalWithRoomIdOpened;
}

const Call: FC<IProps> = ({ modalInfo }) => {
    const dispatch = useAppDispatch();
    const { clients, provideMediaRef, hangUp, startCall } = useWebRTC(
        modalInfo.roomId,
    );
    const { token } = useToken();

    useEffect(() => {
        startCall();
    }, [startCall]);

    const onHangUp = useCallback(() => {
        hangUp();
        dispatch(closeModals());
    }, [dispatch, hangUp]);

    return (
        <Modal
            className={"call"}
            open={modalInfo.isOpen}
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
                    <button onClick={onHangUp} className={"call__decline-btn"}>
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
