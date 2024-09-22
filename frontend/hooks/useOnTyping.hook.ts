import { useCallback, useEffect } from "react";
import { toggleUserTypingSocket } from "@/store/thunks/room";
import { useDebounceCallback } from "@/hooks/useDebounceCallback.hook";
import { useAppDispatch } from "@/hooks/store.hook";
import { usePrevious } from "@/hooks/usePrevious";

interface IProps {
    roomId: string;
    isPreviewRoom: boolean;
    extraFnOnResetDebounced?: (roomId: string) => void;
}

const useOnTyping: ({
    roomId,
    isPreviewRoom,
    extraFnOnResetDebounced,
}: IProps) => {
    onTyping: () => void;
    resetDebouncedOnTypingFunction: () => void;
}
= ({ roomId, isPreviewRoom = true, extraFnOnResetDebounced = () => {} }) => {
    const dispatch = useAppDispatch();
    const previousRoomId = usePrevious(roomId);
    const { debounced, resetDebounceProcessing, isDebounceProcessing } =
        useDebounceCallback(() => {
            if (isPreviewRoom) {
                return;
            }

            void dispatch(
                toggleUserTypingSocket({
                    roomId,
                    isTyping: false,
                }),
            );
            extraFnOnResetDebounced(roomId);
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
        if (isPreviewRoom) {
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
