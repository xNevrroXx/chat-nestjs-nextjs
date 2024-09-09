import { Participant } from "@prisma/client";

export type TNormalizedParticipant = Participant & {
    isTyping: boolean;
    displayName: string;
    color: string;
};
