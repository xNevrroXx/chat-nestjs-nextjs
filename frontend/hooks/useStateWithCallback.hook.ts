// eslint-disable @typescript-eslint/ban-types
import { useCallback, useEffect, useRef, useState } from "react";

const useStateWithCallback = <T,>(initialState: T) => {
    const [state, setState] = useState<T>(initialState);
    const cbRef = useRef<((arg: T) => void) | null>(null);

    const updateState = useCallback(
        (newState: T | ((prev: T) => T), cb: (arg: T) => void): void => {
            cbRef.current = cb;

            setState((prev) =>
                typeof newState === "function"
                    ? (newState as (prev: T) => T)(prev)
                    : newState,
            );
        },
        [],
    );

    useEffect(() => {
        if (!cbRef.current) {
            return;
        }

        cbRef.current(state);
        cbRef.current = null;
    }, [state]);

    return { state, updateState };
};

export { useStateWithCallback };
