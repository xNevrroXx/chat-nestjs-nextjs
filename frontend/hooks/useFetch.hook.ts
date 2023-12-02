import {useCallback, useState} from "react";
import {AxiosRequestConfig} from "axios";
import $api from "../http";

export enum FetchingStatus {
    IDLE = "IDLE",
    FETCHING = "FETCHING",
    FULFILLED = "FULFILLED",
    REJECTED = "REJECTED"
}

const useFetch = <T>(url: string | undefined) => {
    const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.IDLE);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<unknown | null>(null);

    const request = useCallback(async (config: AxiosRequestConfig): Promise<T | void> => {
        if (!url) return;
        setStatus(FetchingStatus.FETCHING);

        try {
            const response = await $api<T>(url, config);
            setData(response.data);
            setStatus(FetchingStatus.FULFILLED);
        } catch (error) {
            setError(error);
            setStatus(FetchingStatus.REJECTED);
        }
    }, [url]);

    const clear = useCallback(() => {
        setStatus(FetchingStatus.IDLE);
        setData(null);
        setError(null);
    }, []);

    return {status, data, error, request, clear};
};

export {useFetch};