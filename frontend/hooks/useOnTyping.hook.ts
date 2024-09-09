import { useCallback, useEffect } from "react";
import { toggleUserTypingSocket } from "@/store/thunks/room";
import { useDebounceCallback } from "@/hooks/useDebounceCallback.hook";
import { useAppDispatch } from "@/hooks/store.hook";
import { usePrevious } from "@/hooks/usePrevious";

interface IProps {
    roomId: string | null;
    isPreviewRoom: boolean | null;
}

const useOnTyping: ({ roomId, isPreviewRoom }: IProps) => {
    onTyping: () => void;
    resetDebouncedOnTypingFunction: () => void;
} = ({ roomId, isPreviewRoom = true }) => {
    const dispatch = useAppDispatch();
    const previousRoomId = usePrevious(roomId);
    const { debounced, resetDebounceProcessing, isDebounceProcessing } =
        useDebounceCallback(() => {
            if (!roomId || isPreviewRoom) {
                return;
            }

            void dispatch(
                toggleUserTypingSocket({
                    roomId,
                    isTyping: false,
                }),
            );
        }, 4000);

    useEffect(() => {
        if (!previousRoomId || !isDebounceProcessing()) {
            return;
        }
        /**
         * when a user changes an active room and onTyping debounced function is processing -
         * it should be fired. (before a user changes a room)
         * */
        void dispatch(
            toggleUserTypingSocket({
                roomId: previousRoomId,
                isTyping: false,
            }),
        );
        resetDebounceProcessing();
    }, [
        dispatch,
        isDebounceProcessing,
        previousRoomId,
        resetDebounceProcessing,
        roomId,
    ]);

    const onTyping = useCallback(() => {
        if (!roomId || isPreviewRoom) {
            return;
        }

        if (isDebounceProcessing()) {
            // if the user has recently typed
            debounced();
            return;
        }

        void dispatch(
            toggleUserTypingSocket({
                roomId,
                isTyping: true,
            }),
        );

        debounced();
    }, [roomId, isPreviewRoom, isDebounceProcessing, dispatch, debounced]);

    return {
        onTyping,
        resetDebouncedOnTypingFunction: resetDebounceProcessing,
    };
};

export { useOnTyping };
