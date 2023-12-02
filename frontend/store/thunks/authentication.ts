"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
// own modules
import { AuthService } from "@/services/Auth.service";
// actions
import { getAll as getAllUsers } from "@/store/thunks/users";
import { setUserId } from "@/store/actions/room";
// types
import type { IUserAuth, TLoginFormData } from "@/models/IStore/IAuthentication";
import { connectSocket, createSocketInstance, disconnectSocket, getAll as getAllChats } from "@/store/thunks/room";
import { IAuthResponse } from "@/models/IResponse/IAuthResponse";
import { RootState } from "@/store";
import { getCookie } from "@/utils/getCookie";

const login = createAsyncThunk<IAuthResponse, TLoginFormData, { state: RootState }>(
    "authentication/login",
    async ({ email, password }: TLoginFormData, thunkAPI) => {
        try {
            const response = await AuthService.login(email, password);

            const dispatch = thunkAPI.dispatch;
            void dispatch(setUserId(response.data.user.id));
            void dispatch(getAllUsers());
            void dispatch(getAllChats());
            await dispatch(createSocketInstance(getCookie("connect.sid") as string));
            void dispatch(connectSocket());

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const logout = createAsyncThunk<void, void, { state: RootState }>(
    "authentication/logout",
    async (_, thunkAPI) => {
        try {
            void thunkAPI.dispatch(disconnectSocket());
            await AuthService.logout();
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const registration = createAsyncThunk<void, IUserAuth, { state: RootState }>(
    "authentication/register",
    async ({ email, name, surname, password, sex, age }: IUserAuth, thunkAPI) => {
        try {
            await AuthService.registration({ email, name, surname, password, sex, age });

            const dispatch = thunkAPI.dispatch;
            void dispatch(login({ email, password }));
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const checkAuthentication = createAsyncThunk<IAuthResponse, void, { state: RootState }>(
    "authentication/check-authentication",
    async (_, thunkAPI) => {
        try {
            const response = await AuthService.checkAuth();

            const dispatch = thunkAPI.dispatch;
            void dispatch(setUserId(response.data.user.id));
            void dispatch(getAllUsers());
            void dispatch(getAllChats());
            await dispatch(createSocketInstance(getCookie("connect.sid") as string));
            void dispatch(connectSocket());

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    });

export { login, logout, registration, checkAuthentication };
