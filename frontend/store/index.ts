import { type Action, type Middleware, configureStore } from "@reduxjs/toolkit";
import reduxThunk from "redux-thunk";
// reducers
import room from "@/store/slices/room";
import users from "@/store/slices/users";
import recentRooms from "@/store/slices/recent-rooms";
import authentication from "@/store/slices/authentication";
import folders from "@/store/slices/rooms-on-folders";
import device from "@/store/slices/device";
import modalWindows from "@/store/slices/modal-windows";

const loggerMiddleware: Middleware =
    (api) =>
    (next: TAppDispatch) =>
    <A extends Action>(action: A) => {
        console.log("will dispatch: ", action);
        next(action);
        console.log("after dispatch: ", api.getState());
    };

const store = configureStore({
    reducer: {
        authentication,
        room,
        users,
        recentRooms,
        folders,
        device,
        modalWindows,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["room/socket:create-instance/fulfilled"],
                ignoredPaths: ["room.socket"],
            },
        }).concat(reduxThunk, loggerMiddleware),
    enhancers: [],
    preloadedState: undefined,
    devTools: process.env.NODE_ENV !== "production",
});

export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;

export { store };
