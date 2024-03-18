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

interface IDialogCardDropdownProps {
    children: JSX.Element;
    roomId: string;
}

const actionKeysToActionNames = {
    "1": {
        label: "Добавить в папку",
        actions: {
            // if it's already in this folder
            remove: excludeRoomFromFolder,
            // if it's not
            add: addRoomOnFolder,
        },
    },
    "2": {
        label: "Очистить историю",
        actions: {
            leave: clearMyHistory,
        },
    },
    "3": {
        label: "Покинуть чат",
        actions: {
            leave: leaveRoom,
        },
    },
};

const DialogCardDropdown: FC<IDialogCardDropdownProps> = ({
    children,
    roomId,
}) => {
    const dispatch = useAppDispatch();
    const folderSuggestions = useAppSelector((state) =>
        folderSuggestionsSelector(state, roomId),
    );

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
        }
    };

    const menuItems = useMemo((): MenuProps["items"] => {
        return [
            {
                label: actionKeysToActionNames["1"].label,
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
                label: actionKeysToActionNames["2"].label,
                key: "2",
            },
            {
                label: actionKeysToActionNames["3"].label,
                key: "3",
            },
        ];
    }, [folderSuggestions]);

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
