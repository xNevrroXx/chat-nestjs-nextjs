import {createAction} from "@reduxjs/toolkit";
import {TUserOnline} from "@/models/auth/IAuth.store";


const handleChangeUserOnlineSocket = createAction<TUserOnline>("users/socket:change-user-online");

export {handleChangeUserOnlineSocket};
