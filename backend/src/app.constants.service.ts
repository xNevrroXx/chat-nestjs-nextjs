import { Global, Injectable } from "@nestjs/common";

@Global()
@Injectable()
export class AppConstantsService {
    readonly CLIENT_URL = process.env.CLIENT_URL;
    readonly BACKEND_URL = process.env.BACKEND_URL;

    readonly PORT = process.env.PORT;
    readonly SMTP_HOST = process.env.SMTP_HOST;
    readonly SMTP_PORT = process.env.SMTP_PORT;
    readonly SMTP_EMAIL_ADDRESS = process.env.SMTP_EMAIL_ADDRESS;
    readonly SMTP_EMAIL_PASSWORD = process.env.SMTP_EMAIL_PASSWORD;

    readonly SESSION_SECRET = process.env.SESSION_SECRET;

    readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    readonly YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
    readonly YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;

    readonly VK_BUCKET_NAME = process.env.VK_BUCKET_NAME;
    readonly VK_STORAGE_URL = process.env.VK_STORAGE_URL;
    readonly VK_STORAGE_REGION = process.env.VK_STORAGE_REGION;
    readonly VK_STORAGE_ENDPOINT = process.env.VK_STORAGE_ENDPOINT;
    readonly VK_STORAGE_ACCESS_KEY = process.env.VK_STORAGE_ACCESS_KEY;
    readonly VK_STORAGE_SECRET_KEY = process.env.VK_STORAGE_SECRET_KEY;
}
