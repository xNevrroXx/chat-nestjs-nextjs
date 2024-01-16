import React, {
    ChangeEventHandler,
    FC,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
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
import { clearPreviewRooms } from "@/store/actions/room";
import { getPreviews } from "@/store/thunks/room";
// styles
import "./dialogs.scss";

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
    const [dialogQueryString, setDialogQueryString] = useState<string>("");
    const filteredLocalDialogs = useAppSelector((state) =>
        filteredRoomsSelector(state, dialogQueryString),
    );

    const filteredRemoteDialogs = useAppSelector(
        (state) => state.room.previews,
    );
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (dialogQueryString.length === 0) {
            dispatch(clearPreviewRooms());
            return;
        }

        void dispatch(getPreviews(dialogQueryString));
    }, [dialogQueryString, dispatch]);

    const onChangeQuery: ChangeEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            startTransition(() => {
                setDialogQueryString(event.target.value);
            });
        },
        [],
    );

    const remoteContent = useMemo(() => {
        if (
            dialogQueryString &&
            filteredRemoteDialogs.status === FetchingStatus.FETCHING
        ) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <Spinner />
                </Fragment>
            );
        }
        else if (
            dialogQueryString &&
            filteredRemoteDialogs.status === FetchingStatus.FULFILLED &&
            (!filteredRemoteDialogs.rooms ||
                filteredRemoteDialogs.rooms.length === 0)
        ) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <Text>Не найдены</Text>
                </Fragment>
            );
        }
        else if (
            dialogQueryString &&
            filteredRemoteDialogs.status === FetchingStatus.FULFILLED &&
            filteredRemoteDialogs.rooms.length > 0
        ) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <ListRemoteDialogs
                        user={user}
                        rooms={filteredRemoteDialogs.rooms}
                        activeRoomId={activeRoomId}
                        onClickRemoteRoom={onClickRemoteRoom}
                    />
                </Fragment>
            );
        }
    }, [
        activeRoomId,
        dialogQueryString,
        filteredRemoteDialogs,
        onClickRemoteRoom,
        user,
    ]);

    const localContent = useMemo(() => {
        if (dialogQueryString && isPending) {
            return (
                <Fragment>
                    <Title level={5}>Ваши чаты:</Title>
                    <Spinner />
                </Fragment>
            );
        }
        else if (dialogQueryString && filteredLocalDialogs.length === 0) {
            return (
                <Fragment>
                    <Title level={5}>Ваши чаты:</Title>
                    <Text>Не найдены</Text>
                </Fragment>
            );
        }
        else if (dialogQueryString && filteredLocalDialogs) {
            return (
                <Fragment>
                    <Title level={5}>Ваши чаты:</Title>
                    <ListLocalDialogs
                        user={user}
                        rooms={filteredLocalDialogs}
                        activeRoomId={activeRoomId}
                        onClickDialog={onClickRoom}
                    />
                </Fragment>
            );
        }

        return (
            <ListLocalDialogs
                user={user}
                rooms={filteredLocalDialogs}
                activeRoomId={activeRoomId}
                onClickDialog={onClickRoom}
                hasDropdown={true}
            />
        );
    }, [
        activeRoomId,
        dialogQueryString,
        filteredLocalDialogs,
        isPending,
        onClickRoom,
        user,
    ]);

    return (
        <Layout className="dialogs" style={{ flex: "0 0 30%" }}>
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
