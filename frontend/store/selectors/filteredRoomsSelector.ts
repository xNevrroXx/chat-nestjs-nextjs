import { createSelector } from "@reduxjs/toolkit";
import { stringSimilarity } from "string-similarity-js";
import { RootState } from "@/store";
import { IRoom } from "@/models/room/IRoom.store";

const filteredRoomsSelector = createSelector(
    [
        (state: RootState) => state.room.local,
        (_: RootState, query: string) => query,
    ],
    (local, query): IRoom[] => {
        if (!query || query.length === 0) {
            return Object.values(local.rooms.byId);
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
