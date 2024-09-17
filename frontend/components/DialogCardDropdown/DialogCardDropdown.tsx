import React, { FC, useMemo } from "react";
import { MenuProps } from "antd/lib";
import { Dropdown } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { folderSuggestionsSelector } from "@/store/selectors/folderSuggestions.selector";
import {
    addRoomOnFolder,
    excludeRoomFromFolder,
} from "@/store/thunks/roomsOnFolders";
import { clearMyHistory, leaveRoom } from "@/store/thunks/room";
import { openModalWithRoomId } from "@/store/actions/modal-windows";
import { findRoomByIdSelector } from "@/store/selectors/findRoomById.selector";
import { RoomType } from "@/models/room/IRoom.store";

interface IDialogCardDropdownProps {
    children: JSX.Element;
    roomId: string;
}

const DialogCardDropdown: FC<IDialogCardDropdownProps> = ({
    children,
    roomId,
}) => {
    const dispatch = useAppDispatch();
    const folderSuggestions = useAppSelector((state) =>
        folderSuggestionsSelector(state, roomId),
    );
    const room = useAppSelector((state) => findRoomByIdSelector(state, roomId));
    const user = useAppSelector((state) => state.authentication.user)!;

    const onClick: MenuProps["onClick"] = ({ key, keyPath }) => {
        const actionKey = keyPath[keyPath.length - 1];

        switch (actionKey) {
            case "1": {
                const [actionName, folderId] = key.split("/");
                if (actionName === "add") {
                    void dispatch(
                        addRoomOnFolder({
                            folderId: folderId,
                            roomId: roomId,
                        }),
                    );
                }
                else if (actionName === "remove") {
                    void dispatch(
                        excludeRoomFromFolder({
                            folderId: folderId,
                            roomId: roomId,
                        }),
                    );
                }
                break;
            }
            case "2": {
                void dispatch(clearMyHistory(roomId));
                break;
            }
            case "3": {
                void dispatch(leaveRoom(roomId));
                break;
            }
            case "4": {
                void dispatch(
                    openModalWithRoomId({
                        modalName: "invitationUsers",
                        roomId: roomId,
                    }),
                );
                break;
            }
            case "5": {
                void dispatch(
                    openModalWithRoomId({
                        modalName: "roomDeletion",
                        roomId: roomId,
                    }),
                );
                break;
            }
        }
    };

    const menuItems = useMemo((): MenuProps["items"] => {
        if (!room) {
            return;
        }

        const inviteUsersButton =
            room.type === RoomType.GROUP
                ? {
                      label: "Пригласить пользователей",
                      key: "4",
                  }
                : null;
        const deleteGroupButton =
            room.type === RoomType.PRIVATE ||
            (room.creatorUserId && room.creatorUserId == user.id)
                ? {
                      label: "Удалить чат",
                      key: "5",
                  }
                : null;

        return [
            {
                label: "Добавить в папку",
                key: "1",
                children: folderSuggestions.map((folder) => {
                    if (folder.isInThisFolder) {
                        return {
                            label: folder.name,
                            key: "remove/" + folder.id,
                            icon: <CheckOutlined />,
                        };
                    }

                    return {
                        label: folder.name,
                        key: "add/" + folder.id,
                    };
                }),
            },
            {
                label: "Очистить историю",
                key: "2",
            },
            inviteUsersButton,
            {
                label: "Покинуть чат",
                key: "3",
            },
            deleteGroupButton,
        ];
    }, [folderSuggestions, room, user.id]);

    return (
        <Dropdown
            menu={{ items: menuItems, onClick }}
            trigger={["contextMenu"]}
        >
            {children}
        </Dropdown>
    );
};

export default DialogCardDropdown;
