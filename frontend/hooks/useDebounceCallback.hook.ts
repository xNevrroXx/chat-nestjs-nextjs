import { useCallback, useRef } from "react";

const useDebounceCallback = <Args extends unknown[]>(
    cb: (...args: Args) => void,
    delay: number,
) => {
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    const resetDebounceProcessing = useCallback(() => {
        if (!timeoutIdRef.current) {
            return;
        }

        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
    }, []);

    const debounced = (...args: Args) => {
        resetDebounceProcessing();

        timeoutIdRef.current = setTimeout(() => {
            cb(...args);
            timeoutIdRef.current = null;
        }, delay);
    };

    const isDebounceProcessing = useCallback(() => {
        return !!timeoutIdRef.current;
    }, []);

    return { debounced, resetDebounceProcessing, isDebounceProcessing };
};

export { useDebounceCallback };
