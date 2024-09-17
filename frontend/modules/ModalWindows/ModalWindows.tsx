import React, { Fragment } from "react";
import { useAppSelector } from "@/hooks/store.hook";
import Call from "@/modals/Call/Call";
import Logout from "@/modals/Logout/Logout";
import FoldersMenu from "@/modals/FoldersMenu/FoldersMenu";
import RoomDeletion from "@/modals/RoomDeletion/RoomDeletion";
import GroupCreation from "@/modals/GroupCreation/GroupCreation";
import FolderCreation from "@/modals/FolderCreation/FolderCreation";
import PinningMessage from "@/modals/PinningMessage/PinningMessage";
import InvitationUsers from "@/modals/InvitationUsers/InvitationUsers";
import MessageDeletion from "@/modals/MessageDeletion/MessageDeletion";
import AccountDeletion from "@/modals/AccountDeletion/AccountDeletion";
import MessageForwarding from "@/modals/MessageForwarding/MessageForwarding";

const ModalWindows = () => {
    const callModalInfo = useAppSelector((state) => state.modalWindows.call);

    return (
        <Fragment>
            <Logout />
            <FoldersMenu />
            <RoomDeletion />
            <GroupCreation />
            <FolderCreation />
            <PinningMessage />
            <InvitationUsers />
            <AccountDeletion />
            <MessageDeletion />
            <MessageForwarding />
            {callModalInfo.isOpen && <Call modalInfo={callModalInfo} />}
        </Fragment>
    );
};

export default ModalWindows;
