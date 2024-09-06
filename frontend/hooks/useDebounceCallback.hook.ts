import { useRef } from "react";

const useDebounceCallback = <Args extends unknown[]>(
    cb: (...args: Args) => void,
    delay: number,
) => {
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    const debounced = (...args: Args) => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = setTimeout(() => {
            cb(...args);
        }, delay);
    };

    return debounced;
};

export { useDebounceCallback };
