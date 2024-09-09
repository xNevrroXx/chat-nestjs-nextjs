import { RoomType, TParticipant } from "@/models/room/IRoom.store";
import { truncateTheText } from "@/utils/truncateTheText";
import { IUserDto } from "@/models/auth/IAuth.store";
import { exhaustiveCheck } from "@/models/TUtils";

interface IProps {
    roomType: RoomType;
    interlocutor: IUserDto | undefined | null;
    participants: TParticipant[] | undefined | null;
}

const useUserStatuses = ({
    roomType,
    interlocutor,
    participants,
}: IProps): string => {
    if (!participants) {
        return "";
    }

    switch (roomType) {
        case RoomType.PRIVATE: {
            if (!interlocutor || !interlocutor.userOnline.isOnline) {
                return "Не в сети";
            }
            else if (participants[0].isTyping) {
                return "Печатает...";
            }
            return "В сети";
        }
        case RoomType.GROUP: {
            const typingUsersText = participants
                .filter((participant) => participant.isTyping)
                .map((participant) => participant.displayName + "...")
                .join(" ");

            return truncateTheText({
                text: typingUsersText,
                maxLength: 50,
            });
        }
    }

    return exhaustiveCheck(roomType);
};

export { useUserStatuses };
