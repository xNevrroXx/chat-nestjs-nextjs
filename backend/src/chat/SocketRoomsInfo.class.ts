import { TValueOf } from "../models/TUtils";
import { Room, User } from "@prisma/client";
import { InternalServerErrorException } from "@nestjs/common";

interface IUserIdWithRoomIds {
    userId: TValueOf<Pick<User, "id">>;
    roomIds: Set<TValueOf<Pick<Room, "id">>>;
}

type TSocketRoomId = TValueOf<Pick<Room, "id">>;
type TUserClientId = string;
interface IUserIDsToSocketIDs {
    [userId: TValueOf<Pick<User, "id">>]: Set<TUserClientId>;
}
interface IUserIdToRoomIds {
    [userId: TValueOf<Pick<User, "id">>]: Set<TSocketRoomId>;
}
interface IRoomIdToUserIds {
    [roomId: TSocketRoomId]: Set<TValueOf<Pick<User, "id">>>;
}
interface ISocketIDsToClientInfo {
    [clientId: TUserClientId]: TValueOf<Pick<User, "id">>;
}

class SocketRoomsInfo {
    private readonly _roomIdToUserIds: IRoomIdToUserIds;
    private readonly _userIdToRoomIds: IUserIdToRoomIds;
    private readonly _socketIdToUserId: ISocketIDsToClientInfo;
    private readonly _userIdToSocketIds: IUserIDsToSocketIDs;

    constructor() {
        this._roomIdToUserIds = {};
        this._userIdToRoomIds = {};
        this._socketIdToUserId = {};
        this._userIdToSocketIds = {};
    }

    initConnection(userId: string, socketId: string): void {
        this._socketIdToUserId[socketId] = userId;

        if (!this._userIdToSocketIds[userId]) {
            this._userIdToSocketIds[userId] = new Set<TUserClientId>();
            this._userIdToRoomIds[userId] = new Set<
                TValueOf<Pick<Room, "id">>
            >();
        }

        this._userIdToSocketIds[userId].add(socketId);
    }

    /**
     *
     * @return {string[] | []} - socket ids of the connected user.
     * */
    joinIfConnected(
        roomId: string,
        userId: string
    ): Readonly<Set<TSocketRoomId>> {
        const socketIds = this.getSocketIdsByUserId(userId);

        if (!socketIds || !socketIds.size) {
            return new Set();
        }

        this.join(roomId, userId);
        return socketIds;
    }

    /**
     * Joining a user to a room.
     * @param {string} roomId - Socket.IO room id;
     * @param {string} userId - The user's ID connecting to the aforementioned room;
     * */
    join(roomId: string, userId: string) {
        this._userIdToRoomIds[userId].add(roomId);

        if (!this._roomIdToUserIds[roomId]) {
            // if there are no users connected to this room.
            this._roomIdToUserIds[roomId] = new Set<
                TValueOf<Pick<User, "id">>
            >();
        }
        this._roomIdToUserIds[roomId].add(userId);
    }

    /**
     * Leaving all rooms by a socket.
     * @param {string} socketId - user's socket id;
     * @return {object} - the object contains the user IDs and their rooms;
     * */
    leaveAll(socketId: string): IUserIdWithRoomIds | null {
        const userId = this._socketIdToUserId[socketId];
        if (!userId) {
            return;
        }

        this._userIdToSocketIds[userId].delete(socketId);
        delete this._socketIdToUserId[socketId];

        const otherConnections = this.getSocketIdsByUserId(userId);
        if (otherConnections.size) {
            return null;
        }

        /*
         * only if the user has no other devices connected to the server -
         * delete the room-user socket data.
         * */
        const roomIds = this._userIdToRoomIds[userId];
        const returnValue = {
            userId,
            roomIds: new Set(roomIds),
        };
        roomIds.forEach((roomId) => {
            this._roomIdToUserIds[roomId].delete(userId);
            this._userIdToRoomIds[userId].delete(roomId);
        });

        return returnValue;
    }

    /**
     * Leaving a room by a user.
     * @param {string} userId - id of the user;
     * @param {string} roomId - room id to leave a group;
     * @return {IUserIdToRoomIds} - the object contains the user id and the remaining rooms;
     * */
    leaveRoomByUserId(
        userId: string,
        roomId: string
    ): {
        userId: string;
        roomIds: Set<TValueOf<Pick<Room, "id">>>;
        clientIds: Set<string>;
    } {
        this._roomIdToUserIds[roomId].delete(userId);
        this._userIdToRoomIds[userId].delete(roomId);

        return {
            userId: userId,
            clientIds: this._userIdToSocketIds[userId],
            roomIds: this._userIdToRoomIds[userId],
        };
    }

    /**
     * Get userIds and them socketIds who are members of the room.
     * @return {IUserIDsToSocketIDs} the object which contains user IDs and their rooms.
     * */
    getUserIdsWithSocketIdsByRoomId(
        roomId: string
    ): Readonly<IUserIDsToSocketIDs> {
        const userIds = this._roomIdToUserIds[roomId];
        return Array.from(userIds).reduce<IUserIDsToSocketIDs>(
            (accum, userId) => {
                accum[userId] = this.getSocketIdsByUserId(userId);
                return accum;
            },
            {}
        );
    }

    getUserRoomsBySocketId(clientId: string): Readonly<Set<TSocketRoomId>> {
        const userId = this._socketIdToUserId[clientId];
        return this._userIdToRoomIds[userId];
    }
    getSocketIdsByUserId(userId: string): Readonly<Set<TUserClientId>> {
        return this._userIdToSocketIds[userId] || new Set();
    }

    isUserInRoom(userId: string, roomId: string): boolean {
        if (!userId || !roomId) {
            throw new InternalServerErrorException();
        }

        const roomInfo = this.getUserIdsWithSocketIdsByRoomId(roomId);
        return !!roomInfo[userId];
    }

    isClientInRoom(socketId: string, roomId: string): boolean {
        const roomIds = this.getUserRoomsBySocketId(socketId);
        if (!roomIds) {
            throw new InternalServerErrorException();
        }

        return roomIds.has(roomId);
    }
}

export { SocketRoomsInfo };
