// third-party modules
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface IAxiosRequestConfigExtra extends AxiosRequestConfig {
    _isRetry: boolean;
}
const isAxiosRequestConfigExtra = (
    _config: AxiosRequestConfig,
): _config is IAxiosRequestConfigExtra => {
    return true;
};

export const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
});

$api.interceptors.response.use(
    function (config: AxiosResponse) {
        return config;
    },
    async function (error: AxiosError) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                if (
                    error.config &&
                    isAxiosRequestConfigExtra(error.config) &&
                    !error.config._isRetry
                ) {
                    error.config._isRetry = true;
                    const originalRequest = error.config;
                    try {
                        return $api.request(originalRequest);
                    }
                    catch (error) {
                        return Promise.reject(error);
                    }
                }
            }
        }
        return Promise.reject(error);
    },
);

export default $api;
