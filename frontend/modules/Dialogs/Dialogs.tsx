import React, {
    ChangeEventHandler,
    FC,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition
} from "react";
import {AxiosRequestConfig} from "axios";
import { Button, Divider, Flex, Input, Layout, Space, theme, Typography } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
// own modules
import {IUserDto} from "@/models/auth/IAuth.store";
import {TValueOf} from "@/models/TUtils";
import { IRoom, TPreviewExistingRoom } from "@/models/room/IRoom.store";
import {useAppSelector} from "@/hooks/store.hook";
import {filteredRoomsSelector} from "@/store/selectors/filteredRoomsSelector";
import {FetchingStatus, useFetch} from "@/hooks/useFetch.hook";
import {Spinner} from "@/components/Spinner/Spinner";
import ListLocalDialogs from "@/components/ListDialogs/ListLocalDialogs";
import ListRemoteDialogs from "@/components/ListDialogs/ListRemoteDialogs";
// styles
import "./dialogs.scss";

const { useToken } = theme;
const { Title, Text } = Typography;
const { Sider } = Layout;

interface IDialogsProps {
    user: IUserDto,
    rooms: IRoom[],
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null,
    onChangeRoom: (roomId: TValueOf<Pick<IRoom, "id">>) => void,
    onJoinRoom: (room: TPreviewExistingRoom) => void,
    openModalToCreateGroup: () => void
}

const Dialogs: FC<IDialogsProps> = ({user, activeRoomId, onChangeRoom, onJoinRoom: onJoinRoomProp, openModalToCreateGroup}) => {
    const {token} = useToken();
    const {
        status,
        data,
        request,
        clear
    } = useFetch<TPreviewExistingRoom[]>((process.env.NEXT_PUBLIC_BASE_URL || "").concat("/room/find-by-query"));
    const [dialogQueryString, setDialogQueryString] = useState<string>("");
    const filteredLocalDialogs = useAppSelector(state => filteredRoomsSelector(state, dialogQueryString));
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (dialogQueryString.length === 0) {
            clear();
            return;
        }

        const config: AxiosRequestConfig = {
            method: "GET",
            params: {
                query: dialogQueryString
            }
        };

        void request(config);
    }, [dialogQueryString, request, clear]);

    const onChangeQuery: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        startTransition(() => {
            setDialogQueryString(event.target.value);
        });
    }, []);

    const onJoinRoom = useCallback((room: TPreviewExistingRoom) => {
        // setDialogQueryString("");
        onJoinRoomProp(room);
    }, [onJoinRoomProp]);


    const remoteContent = useMemo(() => {
        if (dialogQueryString && status === FetchingStatus.FETCHING) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <Spinner/>
                </Fragment>
            );
        }
        else if (dialogQueryString && status === FetchingStatus.FULFILLED && (!data || data.length === 0) ) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <Text>Не найдены</Text>
                </Fragment>
            );
        }
        else if (dialogQueryString && data && status === FetchingStatus.FULFILLED) {
            return (
                <Fragment>
                    <Title level={5}>Возможные чаты:</Title>
                    <ListRemoteDialogs
                        user={user}
                        rooms={data}
                        activeRoomId={activeRoomId}
                        onJoinRoom={onJoinRoom}
                    />
                </Fragment>
            );
        }
    }, [activeRoomId, data, dialogQueryString, onJoinRoom, status, user]);

    const localContent = useMemo(() => {
        if (dialogQueryString && isPending) {
            return (
                <Fragment>
                    <Title level={5}>Ваши чаты:</Title>
                    <Spinner/>
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
                        onClickDialog={onChangeRoom}
                    />
                </Fragment>
            );
        }

        return (
            <ListLocalDialogs
                user={user}
                rooms={filteredLocalDialogs}
                activeRoomId={activeRoomId}
                onClickDialog={onChangeRoom}
            />
        );
    }, [activeRoomId, dialogQueryString, filteredLocalDialogs, isPending, onChangeRoom, user]);

    return (
        <Sider
            theme="light"
            className="dialogs"
        >
            <Space
                direction="vertical"
                className="dialogs__header"
                size="small"
                style={{marginBottom: 0}}
            >
                <Title style={{color: token.colorTextSecondary}} level={4}>Диалоги</Title>
                <Input
                    value={dialogQueryString}
                    onChange={onChangeQuery}
                    placeholder={"Поиск диалогов и пользователей..."}
                />
                <Flex wrap="wrap">
                    <Button
                        block={true}
                        style={{marginTop: "20px"}}
                        size="small"
                        shape="round"
                        icon={<PlusCircleOutlined />}
                        onClick={openModalToCreateGroup}
                    >
                        Создать групповой чат
                    </Button>
                </Flex>
            </Space>
            <Divider />
            <Space
                direction="vertical"
                className="dialogs__lists"
            >
                {localContent}
                {(status !== FetchingStatus.IDLE || data) && <Divider/>}
                {remoteContent}
            </Space>
        </Sider>
    );
};

export default Dialogs;
