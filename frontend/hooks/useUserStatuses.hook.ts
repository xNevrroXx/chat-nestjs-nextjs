import { RoomType, TParticipant } from "@/models/room/IRoom.store";
import { truncateTheText } from "@/utils/truncateTheText";
import { IUserDto, TDepersonalizedUser } from "@/models/auth/IAuth.store";
import { exhaustiveCheck } from "@/models/TUtils";

export interface IUseUserStatuses {
    userId: string;
    roomType: RoomType;
    interlocutor: IUserDto | TDepersonalizedUser | undefined | null;
    participants: TParticipant[] | undefined | null;
}

interface IReturnType {
    numberParticipantsInfo: string;
    otherInfo: string;
}

const useUserStatuses = ({
    userId,
    roomType,
    interlocutor,
    participants,
}: IUseUserStatuses): IReturnType => {
    const result: IReturnType = {
        numberParticipantsInfo: "0 уч.",
        otherInfo: "",
    };

    if (!participants) {
        return result;
    }
    result.numberParticipantsInfo =
        participants.filter((member) => member.isStillMember).length + " уч.";

    switch (roomType) {
        case RoomType.PRIVATE: {
            interlocutor as IUserDto | TDepersonalizedUser;
            if (!interlocutor) {
                return result;
            }
            const interlocutorAsRoomParticipant = participants.find(
                (member) => member.userId === interlocutor.id,
            )!;

            if (interlocutor.isDeleted) {
                result.otherInfo = "Пообщались и хватит...";
                return result;
            }

            if (!interlocutorAsRoomParticipant.isStillMember) {
                result.otherInfo = "Покинул чат";
                return result;
            }

            if (!interlocutor.userOnline.isOnline) {
                result.otherInfo = "Не в сети";
                return result;
            }

            if (participants[0].isTyping) {
                result.otherInfo = "Печатает...";
                return result;
            }

            result.otherInfo = "В сети";
            return result;
        }
        case RoomType.GROUP: {
            const typingUsersText = participants
                .filter(
                    (participant) =>
                        participant.userId !== userId && participant.isTyping,
                )
                .map((participant) => participant.displayName + "...")
                .join(" ");

            result.otherInfo = truncateTheText({
                text: typingUsersText,
                maxLength: 50,
            });

            return result;
        }
    }

    return exhaustiveCheck(roomType);
};

export { useUserStatuses };
