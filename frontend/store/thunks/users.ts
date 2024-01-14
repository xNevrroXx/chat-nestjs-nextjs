import { createAsyncThunk } from "@reduxjs/toolkit";
// own modules
import { UsersService } from "@/services/Users.service";
import { TRootState } from "@/store";
import { IUsersResponse } from "@/models/users/IUser.response";

const getAll = createAsyncThunk<IUsersResponse, void, { state: TRootState }>(
    "users/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await UsersService.getAll();
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    },
);

export { getAll };
