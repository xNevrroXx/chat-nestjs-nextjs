import React, {
    ChangeEventHandler,
    FC,
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
import { resetRecentRoomData } from "@/store/actions/recentRooms";
import { usePrevious } from "@/hooks/usePrevious";

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
    const prevQueryString = usePrevious(dialogQueryString);
    const filteredLocalDialogs = useAppSelector((state) =>
        filteredRoomsSelector(state, dialogQueryString),
    );

    const filteredRemoteDialogs = useAppSelector(
        (state) => state.room.previews,
    );
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (dialogQueryString.length === 0 && prevQueryString.length !== 0) {
            dispatch(clearPreviewRooms());
            if (
                filteredLocalDialogs.every((room) => room.id !== activeRoomId)
            ) {
                dispatch(resetRecentRoomData());
            }
            return;
        }
        if (prevQueryString !== dialogQueryString) {
            void dispatch(getPreviews(dialogQueryString));
        }
    }, [
        activeRoomId,
        dialogQueryString,
        dispatch,
        filteredLocalDialogs,
        prevQueryString,
    ]);

    const onChangeQuery: ChangeEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            startTransition(() => {
                setDialogQueryString(event.target.value);
            });
        },
        [],
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
