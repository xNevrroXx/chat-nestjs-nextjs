import { IRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";

type TModalWindowsStore = {
    call: TCallModalInfo;
    logout: TIsOpen;
    foldersMenu: TIsOpen;
    folderCreation: TIsOpen;
    pinningMessage: TPinningMessageInfo;
    messageForwarding: TForwardingMessageInfo;
    groupCreationMenu: TIsOpen;
};

type TIsOpen = {
    isOpen: boolean;
};

type TForwardingMessageInfo =
    | IForwardingMessageOpened
    | IForwardingMessageClosed;
interface IForwardingMessageOpened {
    isOpen: true;
    forwardingMessageId: string;
}
interface IForwardingMessageClosed {
    isOpen: false;
    forwardingMessageId: null;
}

type TPinningMessageInfo = IPinningMessageOpened | IPinningMessageClosed;
interface IPinningMessageOpened {
    isOpen: true;
    messageId: string;
}
interface IPinningMessageClosed {
    isOpen: false;
    messageId: null;
}

interface IOpenModal {
    modalName: Exclude<
        keyof TModalWindowsStore,
        "messageForwarding" | "call" | "pinningMessage"
    >;
    closeOthers?: boolean;
}

type TCallModalInfo = ICallModalClosed | ICallModalOpened;
interface ICallModalClosed {
    isOpen: false;
    roomId: null;
}
interface ICallModalOpened {
    isOpen: true;
    roomId: string;
}

interface IOpenCallModal {
    roomId: TValueOf<Pick<IRoom, "id">>;
}
interface IOpenForwardingModal {
    forwardingMessageId: string;
}

interface IOpenPinningMessageModal {
    messageId: string;
}

export type {
    TModalWindowsStore,
    IOpenModal,
    IOpenForwardingModal,
    TCallModalInfo,
    TForwardingMessageInfo,
    IOpenCallModal,
    ICallModalOpened,
    ICallModalClosed,
    IOpenPinningMessageModal,
};
