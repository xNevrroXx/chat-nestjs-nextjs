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
        const actionKey = keyPath[1] as keyof typeof actionKeysToActionNames;
        if (actionKey == "1") {
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
        }
    };

    const menuItems = useMemo((): MenuProps["items"] => {
        return Object.entries(actionKeysToActionNames).map(
            ([key, actionInfo]) => {
                return {
                    label: actionInfo.label,
                    key: key,
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
                };
            },
        );
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
