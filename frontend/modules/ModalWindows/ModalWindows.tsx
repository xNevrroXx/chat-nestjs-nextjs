import React, { Fragment } from "react";
import GroupCreation from "@/modals/GroupCreation/GroupCreation";
import FoldersMenu from "@/modals/FoldersMenu/FoldersMenu";
import FolderCreation from "@/modals/FolderCreation/FolderCreation";
import Logout from "@/modals/Logout/Logout";
import MessageForwarding from "@/modals/MessageForwarding/MessageForwarding";
import Call from "@/modals/Call/Call";
import { useAppSelector } from "@/hooks/store.hook";
import PinningMessage from "@/modals/PinningMessage/PinningMessage";

const ModalWindows = () => {
    const callModalInfo = useAppSelector((state) => state.modalWindows.call);

    return (
        <Fragment>
            <Logout />
            <FoldersMenu />
            <GroupCreation />
            <FolderCreation />
            <PinningMessage />
            <MessageForwarding />
            {callModalInfo.isOpen && <Call modalInfo={callModalInfo} />}
        </Fragment>
    );
};

export default ModalWindows;