import {createSelector} from "@reduxjs/toolkit";
import {stringSimilarity} from "string-similarity-js";
import {RootState} from "../index.ts";


const filteredRoomsSelector = createSelector(
    [
        (state: RootState) => state.room.rooms,
        (_: RootState, query: string) => query,
    ],
    (rooms, query) => {
        if (!query || query.length === 0) return rooms;

        return structuredClone(rooms)
            .filter(room => room.name.toLowerCase().includes(query.toLowerCase()))
            .sort((room1, room2) => {
                const score1 = stringSimilarity(room1.name, query, 1, false);
                const score2 = stringSimilarity(room2.name, query, 1, false);
                return score2 - score1;
            });
    }
);

export {filteredRoomsSelector};