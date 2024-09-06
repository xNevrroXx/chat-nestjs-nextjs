import React, {
    ChangeEventHandler,
    FC,
    useCallback,
    useEffect,
    useMemo,
    useTransition,
} from "react";
import { Divider, Input, Layout, Typography } from "antd";
// own modules
import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { filteredRoomsSelector } from "@/store/selectors/filteredRooms.selector";
import { FetchingStatus } from "@/hooks/useFetch.hook";
import { Spinner } from "@/components/Spinner/Spinner";
import ListLocalDialogs from "@/components/ListDialogs/ListLocalDialogs";
import ListRemoteDialogs from "@/components/ListDialogs/ListRemoteDialogs";
import {
    changeQueryStringRooms,
    clearPreviewRooms,
} from "@/store/actions/room";
import { getPreviews } from "@/store/thunks/room";
import { resetCurrentRoomId } from "@/store/actions/recent-rooms";
// styles
import "./dialogs.scss";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface IDialogsProps {
    user: IUserDto;
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null;
    onClickRoom: (roomId: TValueOf<Pick<IRoom, "id">>) => void;
    onClickRemoteRoom: (room: TPreviewExistingRoom) => void;
}

const Dialogs: FC<IDialogsProps> = ({
    user,
    activeRoomId,
    onClickRoom,
    onClickRemoteRoom,
}) => {
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
            void dispatch(getPreviews(dialogQueryString));
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

    const setDialogQueryString = useCallback(
        (str: string) => {
            dispatch(changeQueryStringRooms({ queryString: str }));
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

    const remoteContent = useMemo(() => {
        const content: JSX.Element[] = [];

        if (dialogQueryString) {
            content.push(
                <Title
                    className={"dialogs__pl"}
                    key={"remote dialogs title:"}
                    level={5}
                >
                    Возможные чаты:
                </Title>,
            );

            if (
                dialogQueryString &&
                filteredRemoteDialogs.status === FetchingStatus.FETCHING
            ) {
                content.push(
                    <div
                        className={"dialogs__pl"}
                        key={"remote dialogs spinner"}
                    >
                        <Spinner />
                    </div>,
                );
                return content;
            }
            else if (
                filteredRemoteDialogs.status === FetchingStatus.FULFILLED &&
                filteredRemoteDialogs.rooms.length === 0
            ) {
                content.push(
                    <Text
                        className={"dialogs__pl"}
                        key={"remote dialogs not found"}
                    >
                        Не найдены
                    </Text>,
                );
                return content;
            }
        }

        content.push(
            <ListRemoteDialogs
                key={"list remote dialogs" + dialogQueryString}
                user={user}
                rooms={filteredRemoteDialogs.rooms}
                activeRoomId={activeRoomId}
                onClickRemoteRoom={onClickRemoteRoom}
            />,
        );

        return content;
    }, [
        activeRoomId,
        dialogQueryString,
        filteredRemoteDialogs,
        onClickRemoteRoom,
        user,
    ]);

    const localContent = useMemo(() => {
        const content: JSX.Element[] = [];

        if (dialogQueryString) {
            content.push(
                <Title
                    className={"dialogs__pl"}
                    key={"local dialogs title"}
                    level={5}
                >
                    Ваши чаты:
                </Title>,
            );
            if (isPending) {
                content.push(
                    <div
                        className={"dialogs__pl"}
                        key={"local dialogs spinner"}
                    >
                        <Spinner />
                    </div>,
                );
                return content;
            }
            else if (filteredLocalDialogs.length === 0) {
                content.push(
                    <Text
                        className={"dialogs__pl"}
                        key={"local dialogs not found"}
                    >
                        Не найдены
                    </Text>,
                );
                return content;
            }
        }

        content.push(
            <ListLocalDialogs
                key={"list local dialogs" + dialogQueryString}
                user={user}
                rooms={filteredLocalDialogs}
                activeRoomId={activeRoomId}
                onClickDialog={onClickRoom}
                hasDropdown={true}
            />,
        );

        return content;
    }, [
        activeRoomId,
        dialogQueryString,
        filteredLocalDialogs,
        isPending,
        onClickRoom,
        user,
    ]);

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
                {localContent}
                {(filteredRemoteDialogs.status !== FetchingStatus.IDLE ||
                    filteredRemoteDialogs.rooms.length > 0) && <Divider />}
                {remoteContent}
            </Content>
        </Layout>
    );
};

export default Dialogs;
