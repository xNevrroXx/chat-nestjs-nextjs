import { TValueOf } from "../models/TUtils";
import { User } from "@prisma/client";
import { InternalServerErrorException } from "@nestjs/common";

type TSocketIORoomID = string;
type TSocketsIOClientID = string;
interface IUserIDsToSocketIDs {
    [userId: TValueOf<Pick<User, "id">>]: TSocketsIOClientID[];
}
interface IUserIdWithRoomIDs {
    userId: TValueOf<Pick<User, "id">>;
    roomIDs: Set<TSocketIORoomID>;
}
interface ISocketRoomsInfo {
    [roomId: TSocketIORoomID]: IUserIDsToSocketIDs;
}
interface ISocketIDsToClientInfo {
    [clientId: TSocketsIOClientID]: IUserIdWithRoomIDs;
}

class SocketRoomsInfo {
    private readonly _roomIDsToUserInfo: ISocketRoomsInfo;
    private readonly _socketIDsToUserIDs: ISocketIDsToClientInfo;
    private readonly _userIDsToSocketIDs: IUserIDsToSocketIDs;

    constructor() {
        this._roomIDsToUserInfo = {};
        this._socketIDsToUserIDs = {};
        this._userIDsToSocketIDs = {};
    }

    initConnection(userId: string, socketId: string): void {
        this._socketIDsToUserIDs[socketId] = {
            userId: userId,
            roomIDs: new Set<TSocketIORoomID>(),
        };
        if (this._userIDsToSocketIDs[userId]) {
            this._userIDsToSocketIDs[userId].push(socketId);
        } else {
            this._userIDsToSocketIDs[userId] = [socketId];
        }
    }

    /**
     * @return {string[]} - client ids of the connected user or undefined.
     * */
    joinIfConnected(
        roomId: string,
        userId: string
    ): readonly string[] | undefined {
        const clientIds = this.getSocketIdsByUserId(userId);

        if (!clientIds) {
            return;
        }

        this.join(roomId, userId);
        return clientIds;
    }

    /**
     * Joining a user to a room.
     * @param {string} roomId - Socket.IO room id;
     * @param {string} userId - The user's ID connecting to the aforementioned room;
     * */
    join(roomId: string, userId: string) {
        const userSocketIds = this.getSocketIdsByUserId(userId) as string[];
        this._roomIDsToUserInfo[roomId] = {
            ...this._roomIDsToUserInfo[roomId],
            [userId]: userSocketIds,
        };

        userSocketIds.forEach((socketId) => {
            this._socketIDsToUserIDs[socketId] = {
                ...this._socketIDsToUserIDs[socketId],
                roomIDs: this._socketIDsToUserIDs[socketId].roomIDs.add(roomId),
            };
        });
    }

    /**
     * Leaving a room by a user.
     * @param {string} socketId - user's socket id;
     * @return {IUserIdWithRoomIDs} - the object contains the user IDs and their rooms;
     * */
    leaveAll(socketId: string): IUserIdWithRoomIDs {
        const { userId, roomIDs } = this._socketIDsToUserIDs[socketId];

        roomIDs.forEach((roomId) => {
            delete this._roomIDsToUserInfo[roomId][userId];
        });
        delete this._socketIDsToUserIDs[socketId];
        delete this._userIDsToSocketIDs[userId];

        return { userId, roomIDs };
    }

    /**
     * Leaving a room by a user.
     * @param {string} socketId - user's socket id;
     * @param {string} roomId - room id to leave a group;
     * @return {IUserIdWithRoomIDs} - the object contains the user IDs and their rooms;
     * */
    leaveOne(socketId: string, roomId: string): IUserIdWithRoomIDs {
        const { userId, roomIDs } = this._socketIDsToUserIDs[socketId];

        delete this._roomIDsToUserInfo[roomId][userId];
        this._socketIDsToUserIDs[socketId].roomIDs.delete(roomId);

        return { userId, roomIDs };
    }

    /**
     * get room socket info by room ID
     * @return {IUserIDsToSocketIDs} the object which contains user IDs and their rooms.
     * */
    getRoomInfo(roomId: string): Readonly<IUserIDsToSocketIDs> {
        return this._roomIDsToUserInfo[roomId];
    }

    getUserInfoBySocketId(clientId: string): Readonly<IUserIdWithRoomIDs> {
        return this._socketIDsToUserIDs[clientId];
    }
    getSocketIdsByUserId(
        userId: string
    ): Readonly<TSocketsIOClientID[] | undefined> {
        return this._userIDsToSocketIDs[userId];
    }

    isUserInRoom(userId: string, roomId: string): boolean {
        if (!userId || !roomId) {
            throw new InternalServerErrorException();
        }

        const roomInfo = this.getRoomInfo(roomId);
        return !!roomInfo[userId];
    }

    isClientInRoom(socketId: string, roomId: string): boolean {
        const userInfo = this.getUserInfoBySocketId(socketId);
        if (!userInfo) {
            throw new InternalServerErrorException();
        }

        return userInfo.roomIDs.has(roomId);
    }
}

export { SocketRoomsInfo };
