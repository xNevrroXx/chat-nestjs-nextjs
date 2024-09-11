import { createSlice } from "@reduxjs/toolkit";
// actions
import {
    login,
    logout,
    checkAuthentication,
} from "@/store/thunks/authentication";
// types
import type { TAuthentication } from "@/models/auth/IAuth.store";

const initialState: TAuthentication = {
    user: null,
    isAuthenticated: false,
} as TAuthentication;

const authentication = createSlice({
    name: "authentication",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(checkAuthentication.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
            });
    },
});

const { reducer } = authentication;

export default reducer;
