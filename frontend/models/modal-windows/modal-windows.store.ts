import { IRoom } from "@/models/room/IRoom.store";
import { TValueOf } from "@/models/TUtils";

type TModalWindowsStore = {
    call: TModalWithRoomId;
    logout: TIsOpen;
    foldersMenu: TIsOpen;
    accountDeletion: TIsOpen;
    folderCreation: TIsOpen;
    pinningMessage: TModalWithMessageId;
    messageForwarding: TModalWithMessageId;
    messageDeletion: TModalDeletionInfo;
    groupCreationMenu: TIsOpen;
    roomDeletion: TModalWithRoomId;
};

type TIsOpen = {
    isOpen: boolean;
};
type TClosed = {
    isOpen: false;
};

type TModalWithMessageId = IModalWithMessageIdOpened | TClosed;
type TModalWithRoomId = IModalWithRoomIdOpened | TClosed;
interface IModalWithMessageIdOpened {
    isOpen: true;
    messageId: string;
}
interface IModalWithRoomIdOpened {
    isOpen: true;
    roomId: string;
}

interface IOpenModal {
    modalName: Exclude<
        keyof TModalWindowsStore,
        "messageForwarding" | "call" | "pinningMessage" | "groupDeletion"
    >;
    // @defaultValue true
    closeOthers?: boolean;
}
interface IOpenModalWithRoomId {
    modalName: Extract<keyof TModalWindowsStore, "call" | "groupDeletion">;
    roomId: TValueOf<Pick<IRoom, "id">>;
}
interface IOpenModalWithMessageId {
    modalName: Extract<
        keyof TModalWindowsStore,
        "messageForwarding" | "pinningMessage"
    >;
    messageId: string;
}

type TModalDeletionInfo = TModalDeletionInfoOpened | TClosed;
type TModalDeletionInfoOpened = IModalWithMessageIdOpened &
    IModalWithRoomIdOpened & {
        senderId: string;
    };
type TOpenModalDeletion = Omit<TModalDeletionInfoOpened, "isOpen">;

export type {
    TModalWindowsStore,
    IOpenModal,
    TOpenModalDeletion,
    IOpenModalWithMessageId,
    TModalWithRoomId,
    IOpenModalWithRoomId,
    IModalWithRoomIdOpened,
};
