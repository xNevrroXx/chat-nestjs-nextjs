import { TValueOf } from "@/models/TUtils";
import { IUserDto } from "@/models/auth/IAuth.store";

export enum LiveCommunicationType {
    CALL,
    VIDEO_CALL
}

// from client
export interface ILiveCommunicationInvite {
    memberIds: TValueOf<Pick<IUserDto, "id">>[],
    proposedType: LiveCommunicationType,
}

export interface ILiveCommunicationRespondToInvitation {
    response: boolean
}

export interface ILiveCommunicationTransferData {
    type: LiveCommunicationType,
    data: Blob
}


// from server
export interface ILiveCommunicationInvitation {
    response: boolean;
}

export interface ILiveCommunicationResponseToInvitation {
    memberIds: TValueOf<Pick<IUserDto, "id">>[],
    proposedType: LiveCommunicationType,
}

export interface ILiveCommunicationReceiveData extends ILiveCommunicationTransferData{
    userId: TValueOf<Pick<IUserDto, "id">>
}

export interface ILiveCommunicationLeft {
    userId: TValueOf<Pick<IUserDto, "id">>,
}
const method = "POST";
type TTestType<M extends "GET" | "POST"> = M extends "POST" ? {withObject: true} : null;
const testValue: TTestType<typeof method> = {withObject: true};
