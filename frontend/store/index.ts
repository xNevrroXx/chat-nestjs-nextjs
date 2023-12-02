import {type Action, type Middleware, configureStore} from "@reduxjs/toolkit";
import reduxThunk from "redux-thunk";
// reducers
import authentication from "@/store/slices/authentication";
import room from "@/store/slices/room";
import users from "@/store/slices/users";

const loggerMiddleware: Middleware = (api) => (next: AppDispatch) => <A extends Action>(action: A) => {
    console.log("will dispatch: ", action);
    next(action);
    console.log("after dispatch: ", api.getState());
};

const store = configureStore({
    reducer: {authentication, room, users},
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
              ignoredActionPaths: ["authentication/login/rejected"],
              ignoredActions: [
                  "room/socket:create-instance/fulfilled",
                  "room/get-all/fulfilled",
                  "room/socket:handle-message",
                  "room/socket:send-message/pending",
                  "room/socket:send-message/fulfilled",

                  "users/get-all/fulfilled"
              ],
              ignoredPaths: ["room.socket", "room.rooms", "users"]
          }
        }).concat(reduxThunk, loggerMiddleware),
    enhancers: [],
    preloadedState: undefined,
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {store};
