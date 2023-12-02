import {createAction} from "@reduxjs/toolkit";
import {TUserOnline} from "@/models/IStore/IAuthentication";


const handleChangeUserOnlineSocket = createAction<TUserOnline>("users/socket:change-user-online");

export {handleChangeUserOnlineSocket};