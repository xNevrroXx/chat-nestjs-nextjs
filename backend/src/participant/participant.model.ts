import { Participant } from "@prisma/client";

export type TNormalizedParticipant = Participant & {
    isTyping: boolean;
    displayName: string;
    color: string;
};

export type TInviteUsers = {
    roomId: string;
    mentionIds: string[];
};
export type TRequestedMember = PromiseSettledResult<TNormalizedParticipant>;
export type TResultInvitingUsers = {
    roomId: string;
    requestedMembers: TRequestedMember[];
};
