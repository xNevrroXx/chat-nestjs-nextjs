import { useCallback, useRef } from "react";

const useDebounceCallback = <Args extends unknown[]>(
    cb: (...args: Args) => void,
    delay: number,
) => {
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    const resetDebounceProcessing = useCallback(() => {
        clearTimeout(timeoutIdRef.current!);
        timeoutIdRef.current = null;
    }, []);

    const debounced = useCallback(
        (...args: Args) => {
            resetDebounceProcessing();

            timeoutIdRef.current = setTimeout(() => {
                timeoutIdRef.current = null;
                cb(...args);
            }, delay);
        },
        [cb, delay, resetDebounceProcessing],
    );

    const isDebounceProcessing = useCallback(() => {
        return !!timeoutIdRef.current;
    }, []);

    return { debounced, resetDebounceProcessing, isDebounceProcessing };
};

export { useDebounceCallback };
