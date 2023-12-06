import { TValueOf } from "../models/TUtils";
import { User } from "@prisma/client";

type TSocketIORoomID = string;
type TSocketIOClientID = string;
interface IUserIDsToSocketIDs {
    [userId: TValueOf<Pick<User, "id">>]: TSocketIOClientID;
}
interface IUserIdWithRoomsIDs {
    userId: TValueOf<Pick<User, "id">>;
    roomIDs: Set<TSocketIORoomID>;
}
interface ISocketRoomsInfo {
    [roomId: TSocketIORoomID]: IUserIDsToSocketIDs;
}
interface ISocketIDsToClientInfo {
    [clientId: TSocketIOClientID]: IUserIdWithRoomsIDs;
}

class SocketRoomsInfo {
    private readonly _data: ISocketRoomsInfo;
    private readonly _socketIDsToUserIDs: ISocketIDsToClientInfo;

    constructor() {
        this._data = {};
        this._socketIDsToUserIDs = {};
    }

    /**
     * Joining a user to a room.
     * @param {string} roomId - Socket.IO room id;
     * @param {string} userId - The user ID connected to the aforementioned room;
     * @param {string} socketId - user's socket id;
     * */
    join(roomId: string, userId: string, socketId: string) {
        this._data[roomId] = {
            ...this._data[roomId],
            [userId]: socketId,
        };
        const isExistClient = !!this._socketIDsToUserIDs[socketId];

        if (isExistClient) {
            this._socketIDsToUserIDs[socketId] = {
                ...this._socketIDsToUserIDs[socketId],
                roomIDs: this._socketIDsToUserIDs[socketId].roomIDs.add(roomId),
            };
        } else {
            const roomIDs = new Set<TSocketIORoomID>().add(roomId);
            this._socketIDsToUserIDs[socketId] = {
                userId: userId,
                roomIDs: roomIDs,
            };
        }
    }

    /**
     * Leaving a room by a user.
     * @param {string} socketId - user's socket id;
     * @return {IUserIdWithRoomsIDs} - the object contains the user IDs and their rooms;
     * */
    leave(socketId: string) {
        const { userId, roomIDs } = this._socketIDsToUserIDs[socketId];

        roomIDs.forEach((roomId) => {
            delete this._data[roomId][userId];
        });
        delete this._socketIDsToUserIDs[socketId];

        return { userId, roomIDs };
    }

    /**
     * get room socket info by room ID
     * @return {IUserIDsToSocketIDs} the object which contains user IDs and their rooms.
     * */
    getRoomInfo(roomId: string): Readonly<IUserIDsToSocketIDs> {
        return this._data[roomId];
    }
}

export { SocketRoomsInfo };
