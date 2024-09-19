import { useEffect, useRef } from "react";

const usePrevious = <T,>(value: T) => {
    const currentValueRef = useRef<T>(value);
    const previousValueRef = useRef<T>();

    if (currentValueRef.current !== value) {
        previousValueRef.current = currentValueRef.current;
        currentValueRef.current = value;
    }

    return previousValueRef.current;
};

const usePreviousDataWithRoomId = <T,>(value: T & { roomId: string }) => {
    const currentValueRef = useRef<T & { roomId: string }>(value);
    const previousValueRef = useRef<T & { roomId: string }>();

    if (currentValueRef.current.roomId !== value.roomId) {
        currentValueRef.current = value;
    }
    else {
        currentValueRef.current = value;
        previousValueRef.current = currentValueRef.current;
    }

    return previousValueRef.current;
};

export { usePrevious, usePreviousDataWithRoomId };
