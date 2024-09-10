"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
// own modules
import { getCookie } from "@/utils/getCookie";
import { AuthService } from "@/services/Auth.service";
import { getAll as getAllUsers } from "@/store/thunks/users";
import { setUserId } from "@/store/actions/room";
import { getAllFolders } from "@/store/thunks/roomsOnFolders";
import { UserService } from "@/services/UserService";
import {
    connectSocket,
    createSocketInstance,
    disconnectSocket,
    getAll as getAllChats,
} from "@/store/thunks/room";
// types
import type { IUserAuth, TLoginFormData } from "@/models/auth/IAuth.store";
import { IAuthResponse } from "@/models/auth/IAuth.response";
import { TRootState } from "@/store";
import { IDepersonalizeOrDeleteAccount } from "@/models/users/IUsers.store";

const login = createAsyncThunk<
    IAuthResponse,
    TLoginFormData,
    { state: TRootState }
>(
    "authentication/login",
    async ({ email, password }: TLoginFormData, thunkAPI) => {
        try {
            const response = await AuthService.login(email, password);

            const dispatch = thunkAPI.dispatch;
            void dispatch(setUserId(response.data.user.id));
            void dispatch(getAllUsers());
            void dispatch(getAllChats()).then(() => {
                void dispatch(getAllFolders());
            });
            void dispatch(
                createSocketInstance(getCookie("connect.sid") as string),
            ).then(() => {
                void dispatch(connectSocket());
            });

            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const logout = createAsyncThunk<void, void, { state: TRootState }>(
    "authentication/logout",
    async (_, thunkAPI) => {
        try {
            void thunkAPI.dispatch(disconnectSocket());
            await AuthService.logout();
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const deleteAccount = createAsyncThunk<
    void,
    IDepersonalizeOrDeleteAccount,
    { state: TRootState }
>(
    "authentication/account-deletion",
    async (whetherDepersonalizeAccount, thunkAPI) => {
        try {
            void thunkAPI.dispatch(disconnectSocket());
            await UserService.deleteAccount(whetherDepersonalizeAccount);
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const registration = createAsyncThunk<void, IUserAuth, { state: TRootState }>(
    "authentication/register",
    async (
        {
            email,
            givenName,
            familyName,
            password,
            sex,
            age,
            displayName,
        }: IUserAuth,
        thunkAPI,
    ) => {
        try {
            await AuthService.registration({
                email,
                givenName,
                familyName,
                password,
                sex,
                age,
                displayName,
            });

            const dispatch = thunkAPI.dispatch;
            void dispatch(login({ email, password }));
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

const checkAuthentication = createAsyncThunk<
    IAuthResponse,
    void,
    { state: TRootState }
>("authentication/check-authentication", async (_, thunkAPI) => {
    try {
        const response = await AuthService.checkAuth();

        const dispatch = thunkAPI.dispatch;
        void dispatch(setUserId(response.data.user.id));
        void dispatch(getAllUsers());
        void dispatch(getAllChats()).then(() => {
            void dispatch(getAllFolders());
        });
        void dispatch(
            createSocketInstance(getCookie("connect.sid") as string),
        ).then(() => {
            void dispatch(connectSocket());
        });

        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export { login, logout, deleteAccount, registration, checkAuthentication };
