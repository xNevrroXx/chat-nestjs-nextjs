import React, {
    ChangeEventHandler,
    FC,
    Fragment,
    useCallback,
    useEffect,
    useTransition,
} from "react";
import { Divider, Input, Layout, Typography } from "antd";
// own modules
import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { filteredRoomsSelector } from "@/store/selectors/filteredRooms.selector";
import ListLocalDialogs from "@/components/ListDialogs/ListLocalDialogs";
import ListRemoteDialogs from "@/components/ListDialogs/ListRemoteDialogs";
import {
    changeQueryStringRooms,
    clearPreviewRooms,
} from "@/store/actions/room";
import { getPreviewRoomsByQuery } from "@/store/thunks/room";
import {
    addRecentRoomData,
    resetCurrentRoomId,
} from "@/store/actions/recent-rooms";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
// styles
import "./dialogs.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

interface IDialogsProps {
    user: IUserDto;
}

const Dialogs: FC<IDialogsProps> = ({ user }) => {
    const dispatch = useAppDispatch();
    const currentActiveRoom = useAppSelector(activeRoomSelector);
    const dialogQueryString = useAppSelector((state) => state.room.queryString);
    const filteredLocalDialogs = useAppSelector((state) =>
        filteredRoomsSelector(state, dialogQueryString),
    );
    const filteredRemoteDialogs = useAppSelector(
        (state) => state.room.previews,
    );
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        /*
         * Баг был:
         * 1) делается запрос на сервер
         * 2) стираем букву, но запрос на сервер еще не выполнен
         * 3) сбрасываются room previews
         * 4) приходят данные с сервера, хотя они уже неактуальны
         * */

        // P.S: Debounce не помог.

        // Сейчас AsyncThunk просто реджектится, если изменился queryString.

        if (dialogQueryString.trim()) {
            void dispatch(getPreviewRoomsByQuery(dialogQueryString));
        }
        else {
            dispatch(clearPreviewRooms());
        }
    }, [dialogQueryString, dispatch]);

    useEffect(() => {
        if (currentActiveRoom) {
            return;
        }
        // reset the current PREVIEW room if this one isn't in the store.
        dispatch(resetCurrentRoomId());
    }, [currentActiveRoom, dispatch]);

    const onClickRoom = useCallback(
        (roomId: TValueOf<Pick<IRoom, "id">>) => {
            if (roomId === (currentActiveRoom && currentActiveRoom.id)) {
                return;
            }

            dispatch(
                addRecentRoomData({
                    id: roomId,
                }),
            );
        },
        [currentActiveRoom, dispatch],
    );

    const onClickRemoteRoom = useCallback(
        (remoteRoomId: TValueOf<Pick<TPreviewExistingRoom, "id">>) => {
            dispatch(
                addRecentRoomData({
                    id: remoteRoomId,
                    isPreview: true,
                }),
            );
        },
        [dispatch],
    );

    const onPressEnterOnDialog = useCallback(
        (
            event: KeyboardEvent,
            roomId: string,
            cb: (roomId: string) => void,
        ) => {
            if (event.key !== "Enter") {
                return;
            }

            cb(roomId);
        },
        [],
    );

    const setDialogQueryString = useCallback(
        (str: string) => {
            dispatch(
                changeQueryStringRooms({
                    queryString: str,
                }),
            );
        },
        [dispatch],
    );

    const onChangeQuery: ChangeEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            startTransition(() => {
                setDialogQueryString(event.target.value);
            });
        },
        [setDialogQueryString],
    );

    return (
        <Layout className="dialogs">
            <Header
                className="dialogs__header"
                style={{ margin: 0, padding: "0 12px" }}
            >
                <Input
                    style={{
                        borderRadius: "15px",
                    }}
                    value={dialogQueryString}
                    onChange={onChangeQuery}
                    placeholder={"Поиск диалогов и пользователей..."}
                />
            </Header>
            <Divider />
            <Content>
                {dialogQueryString && (
                    <Title
                        className={"dialogs__pl"}
                        key={"local dialogs title"}
                        level={5}
                    >
                        Ваши чаты:
                    </Title>
                )}
                <ListLocalDialogs
                    key={"list local dialogs" + dialogQueryString}
                    user={user}
                    rooms={filteredLocalDialogs}
                    activeRoomId={
                        currentActiveRoom ? currentActiveRoom.id : null
                    }
                    onClickDialog={onClickRoom}
                    hasDropdown={true}
                    isPending={isPending}
                    dialogQueryString={dialogQueryString}
                />
                {dialogQueryString && (
                    <Fragment>
                        <Divider />
                        <Title
                            className={"dialogs__pl"}
                            key={"remote dialogs title:"}
                            level={5}
                        >
                            Возможные чаты:
                        </Title>
                        <ListRemoteDialogs
                            key={"list remote dialogs" + dialogQueryString}
                            rooms={filteredRemoteDialogs.rooms}
                            statusFetching={filteredRemoteDialogs.status}
                            dialogQueryString={dialogQueryString}
                            activeRoomId={
                                currentActiveRoom ? currentActiveRoom.id : null
                            }
                            onClickRemoteRoom={onClickRemoteRoom}
                        />
                    </Fragment>
                )}
            </Content>
        </Layout>
    );
};

export default Dialogs;
