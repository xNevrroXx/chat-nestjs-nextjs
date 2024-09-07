import { TValueOf } from "@/models/TUtils";
import { IOriginalMessage, IRoom } from "@/models/room/IRoom.store";
import { FC, useCallback, useState } from "react";
import PinnedMessage from "@/components/PinnedMessage/PinnedMessage";
import { unpinMessageSocket } from "@/store/thunks/room";
import { useAppDispatch, useAppSelector } from "@/hooks/store.hook";
import { pinnedMessagesSelector } from "@/store/selectors/pinnedMessages.selector";
// styles
import "./pinned-messages.scss";

interface IProps {
    roomId: TValueOf<Pick<IRoom, "id">>;
}

const PinnedMessages: FC<IProps> = ({ roomId }) => {
    const dispatch = useAppDispatch();
    const pinnedMessages = useAppSelector((state) =>
        pinnedMessagesSelector(state, roomId),
    );
    const [indexActivePinMessage, setIndexActivePinMessage] =
        useState<number>(0);

    const onNextPinnedMessage = useCallback(() => {
        if (indexActivePinMessage === pinnedMessages.length - 1) {
            setIndexActivePinMessage(0);
            return;
        }

        setIndexActivePinMessage((prev) => prev + 1);
    }, [indexActivePinMessage, pinnedMessages.length]);

    const onUnpinMessage = useCallback(
        (messageId: TValueOf<Pick<IOriginalMessage, "id">>) => {
            if (
                indexActivePinMessage >= pinnedMessages.length - 1 &&
                indexActivePinMessage > 0
            ) {
                setIndexActivePinMessage(indexActivePinMessage - 1);
            }

            void dispatch(unpinMessageSocket({ messageId: messageId }));
        },
        [dispatch, indexActivePinMessage, pinnedMessages.length],
    );

    if (!pinnedMessages.length) {
        return;
    }

    return (
        <div className="pinned-messages">
            <PinnedMessage
                key={"pinned" + pinnedMessages[indexActivePinMessage].id}
                indexMessage={indexActivePinMessage + 1}
                message={pinnedMessages[indexActivePinMessage]}
                roomId={roomId}
                onUnpinMessage={() =>
                    onUnpinMessage(pinnedMessages[indexActivePinMessage].id)
                }
                onClickPinMessage={onNextPinnedMessage}
            />
        </div>
    );
};

export default PinnedMessages;
