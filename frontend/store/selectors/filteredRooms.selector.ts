import { createSelector } from "@reduxjs/toolkit";
import { stringSimilarity } from "string-similarity-js";
import { TRootState } from "@/store";
import { IRoom } from "@/models/room/IRoom.store";

const filteredRoomsSelector = createSelector(
    [
        (state: TRootState) => state.room.local,
        (state: TRootState) => state.folders,
        (_: TRootState, query: string) => query,
    ],
    (local, folders, query): IRoom[] => {
        if (query.length === 0) {
            if (!folders.current) {
                return Object.values(local.rooms.byId);
            }

            const roomsIds = folders.folders.byId[folders.current].roomIds;
            return roomsIds.map((id) => local.rooms.byId[id]);
        }

        return structuredClone(Object.values(local.rooms.byId))
            .filter((room) =>
                room.name.toLowerCase().includes(query.toLowerCase()),
            )
            .sort((room1, room2) => {
                const score1 = stringSimilarity(room1.name, query, 1, false);
                const score2 = stringSimilarity(room2.name, query, 1, false);
                return score2 - score1;
            });
    },
);

export { filteredRoomsSelector };
