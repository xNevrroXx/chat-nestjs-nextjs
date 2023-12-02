import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {UsersService} from "@/services/Users.service";
import {RootState} from "@/store";
import {TUsersResponse} from "@/models/IResponse/IUsersResponse";


const getAll = createAsyncThunk<TUsersResponse, void, {state: RootState}>(
    "users/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await UsersService.getAll();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll};
