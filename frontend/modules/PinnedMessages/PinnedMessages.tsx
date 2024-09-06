import { TValueOf } from "@/models/TUtils";
import { IRoom, TPinnedMessage } from "@/models/room/IRoom.store";
import { FC, useCallback, useMemo, useState } from "react";
import PinnedMessage from "@/components/PinnedMessage/PinnedMessage";
import { unpinMessageSocket } from "@/store/thunks/room";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
// styles
import "./pinned-messages.scss";
import { pinnedMessagesSelector } from "@/store/selectors/pinnedMessages.selector";

interface IProps {
    roomId: TValueOf<Pick<IRoom, "id">>;
}

const PinnedMessages: FC<IProps> = ({ roomId }) => {
    const dispatch = useAppDispatch();
    const pinnedMessages = useAppSelector((state) =>
        pinnedMessagesSelector(state, roomId),
    );
    const [indexActivePinMessage, setIndexActivePinMessage] = useState<number>(
        pinnedMessages.length - 1,
    );

    const onNextPinnedMessage = useCallback(() => {
        if (indexActivePinMessage === 0) {
            setIndexActivePinMessage(pinnedMessages.length - 1);
            return;
        }

        setIndexActivePinMessage((prev) => prev - 1);
    }, [indexActivePinMessage, pinnedMessages.length]);

    const onUnpinMessage = useCallback(
        (pinnedMessageId: TValueOf<Pick<TPinnedMessage, "id">>) => {
            onNextPinnedMessage();
            void dispatch(unpinMessageSocket({ pinnedMessageId }));
        },
        [dispatch, onNextPinnedMessage],
    );

    const activePinnedMessage = useMemo(() => {
        const targetPinnedMessage = pinnedMessages[indexActivePinMessage];

        if (!pinnedMessages || !targetPinnedMessage) {
            return;
        }

        return (
            <PinnedMessage
                key={targetPinnedMessage.id}
                indexMessage={indexActivePinMessage + 1}
                messageBriefInfo={{
                    id: targetPinnedMessage.message.id,
                    date: targetPinnedMessage.message.date,
                }}
                roomId={roomId}
                onUnpinMessage={() => onUnpinMessage(targetPinnedMessage.id)}
                onClickPinMessage={onNextPinnedMessage}
            />
        );
    }, [
        indexActivePinMessage,
        onNextPinnedMessage,
        onUnpinMessage,
        pinnedMessages,
        roomId,
    ]);

    if (!pinnedMessages.length) {
        return;
    }

    return <div className="pinned-messages">{activePinnedMessage}</div>;
};

export default PinnedMessages;
