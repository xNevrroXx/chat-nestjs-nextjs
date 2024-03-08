import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TValueOf } from "@/models/TUtils";

interface IDeviceSlice {
    screen: {
        width: number;
        height: number;
    };
}

const initialState: IDeviceSlice = {
    screen: {
        width: 1920,
        height: 1080,
    },
};

const device = createSlice({
    name: "device",
    initialState,
    reducers: {
        updateScreenInfo(
            state,
            action: PayloadAction<TValueOf<Pick<IDeviceSlice, "screen">>>,
        ) {
            state.screen = action.payload;
        },
    },
});

const { reducer } = device;
const { updateScreenInfo } = device.actions;

export { updateScreenInfo };
export default reducer;
