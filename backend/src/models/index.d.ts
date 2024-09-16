/* eslint-disable @typescript-eslint/naming-convention */
import { IUserSessionPayload } from "../user/user.model";

declare global {
    namespace NestJS {
        export interface ExecutionContext {
            user?: IUserSessionPayload;
        }
        export interface Socket {
            user?: IUserSessionPayload;
        }
    }

    namespace SocketIO {
        // todo: how to properly do this one?
        export interface Socket {
            user?: IUserSessionPayload;
        }
    }

    namespace Express {
        export interface Request {
            user?: IUserSessionPayload;
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_URL: string;

            SESSION_SECRET: string;

            PORT: number;
            SMTP_HOST: string;
            SMTP_PORT: number;
            SMTP_EMAIL_ADDRESS: string;
            SMTP_EMAIL_PASSWORD: string;

            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            YANDEX_CLIENT_ID: string;
            YANDEX_CLIENT_SECRET: string;

            VK_BUCKET_NAME: string;
            VK_STORAGE_URL: string;
            VK_STORAGE_REGION: string;
            VK_STORAGE_ENDPOINT: string;
            VK_STORAGE_ACCESS_KEY: string;
            VK_STORAGE_SECRET_KEY: string;
        }
    }
}
