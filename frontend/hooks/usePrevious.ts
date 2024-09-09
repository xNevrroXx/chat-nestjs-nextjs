import { useRef } from "react";

const usePrevious = <T,>(value: T) => {
    const currentValueRef = useRef<T>(value);
    const previousValueRef = useRef<T>();

    if (currentValueRef.current !== value) {
        previousValueRef.current = currentValueRef.current;
        currentValueRef.current = value;
    }

    return previousValueRef.current;
};

export { usePrevious };
