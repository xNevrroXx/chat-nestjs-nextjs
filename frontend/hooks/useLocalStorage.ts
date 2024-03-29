"use client";

import { useState, useEffect } from "react";

function getStorageValue(key: string, defaultValue: string) {
    // getting stored value
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(key);
        return saved || defaultValue;
    }
}

export const useLocalStorage = (key: string, defaultValue: string) => {
    const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        if (!value) {
            return;
        }
        // storing input name
        localStorage.setItem(key, value);
    }, [key, value]);

    return [value, setValue];
};
