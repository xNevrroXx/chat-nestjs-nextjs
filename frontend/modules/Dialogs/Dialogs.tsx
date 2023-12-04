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
import {IUserDto} from "@/models/IStore/IAuthentication";
import {TValueOf} from "@/models/TUtils";
import {IRoom, TTemporarilyRoomOrUserBySearch} from "@/models/IStore/IRoom";
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
    onChangeDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void,
    onCreateNewDialog: (room: TTemporarilyRoomOrUserBySearch) => void,
    openModalToCreateGroup: () => void
}

const Dialogs: FC<IDialogsProps> = ({user, activeRoomId, onChangeDialog, onCreateNewDialog, openModalToCreateGroup}) => {
    const {token} = useToken();
    const {
        status,
        data,
        request,
        clear
    } = useFetch<TTemporarilyRoomOrUserBySearch[]>((process.env.NEXT_PUBLIC_BASE_URL || "").concat("/room/find-by-query"));
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

    const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        startTransition(() => {
            setDialogQueryString(event.target.value);
        });
    }, []);

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
                        onCreateNewDialog={onCreateNewDialog}
                    />
                </Fragment>
            );
        }
    }, [activeRoomId, data, dialogQueryString, onCreateNewDialog, status, user]);

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
                        onClickDialog={onChangeDialog}
                    />
                </Fragment>
            );
        }

        return (
            <ListLocalDialogs
                user={user}
                rooms={filteredLocalDialogs}
                activeRoomId={activeRoomId}
                onClickDialog={onChangeDialog}
            />
        );
    }, [activeRoomId, dialogQueryString, filteredLocalDialogs, isPending, onChangeDialog, user]);

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
                    onChange={onChange}
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
