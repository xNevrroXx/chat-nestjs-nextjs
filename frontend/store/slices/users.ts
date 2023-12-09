import {createSlice} from "@reduxjs/toolkit";
// actions
import {getAll} from "@/store/thunks/users";
// types
import type {IUsers} from "@/models/users/IUsers.store";
import {handleChangeUserOnlineSocket} from "@/store/actions/users";


const initialState: IUsers = {
    users: []
};

const users = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getAll.fulfilled, (state, action) => {
                state.users = action.payload.users;
            })
            .addCase(handleChangeUserOnlineSocket, (state, action) => {
                const targetUser = state.users.find(user => user.id === action.payload.userId);
                if (!targetUser) return;
                targetUser.userOnline = action.payload;
            });
    }
});

const {reducer} = users;

export default reducer;
