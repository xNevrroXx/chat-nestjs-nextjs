import { Global, Injectable } from "@nestjs/common";

@Global()
@Injectable()
export class AppConstantsService {
    readonly CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
    readonly BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

    readonly PORT = process.env.PORT || 3001;
    readonly SMTP_HOST = process.env.SMTP_HOST || "fake";
    readonly SMTP_PORT = process.env.SMTP_PORT || 432;
    readonly SMTP_EMAIL_ADDRESS = process.env.SMTP_EMAIL_ADDRESS || "fake";
    readonly SMTP_EMAIL_PASSWORD = process.env.SMTP_EMAIL_PASSWORD || "fake";

    readonly SESSION_SECRET = process.env.SESSION_SECRET || "fake";

    readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "fake";
    readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "fake";
    readonly YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID || "fake";
    readonly YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET || "fake";

    readonly VK_BUCKET_NAME = process.env.VK_BUCKET_NAME || "fake";
    readonly VK_STORAGE_URL = process.env.VK_STORAGE_URL || "fake";
    readonly VK_STORAGE_REGION = process.env.VK_STORAGE_REGION || "fake";
    readonly VK_STORAGE_ENDPOINT = process.env.VK_STORAGE_ENDPOINT || "fake";
    readonly VK_STORAGE_ACCESS_KEY = process.env.VK_STORAGE_ACCESS_KEY || "fake";
    readonly VK_STORAGE_SECRET_KEY = process.env.VK_STORAGE_SECRET_KEY || "fake";
}
