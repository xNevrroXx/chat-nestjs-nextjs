import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exceptions/http-exception.filter";
import * as passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import {AppConstantsService} from "./app.constants.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const appConstants = app.get(AppConstantsService);
    app.enableCors({
        credentials: true,
        origin: appConstants.CLIENT_URL,
    })
    app.setGlobalPrefix("api");
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        })
    );

    // passport auth configuration
    app.use(
        session({
            secret: appConstants.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
                httpOnly: false,
            },
            store: new PrismaSessionStore(new PrismaClient(), {
                ttl: 1000 * 60 * 60 * 24 * 5, // 5 days
                checkPeriod: 1000 * 60 * 2, // every 2 minutes remove expired sessions from DB
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }),
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalFilters(new HttpExceptionFilter());

    app.enableShutdownHooks();
    await app.listen(appConstants.PORT);

    const url = new URL(await app.getUrl());
    console.log("listening on:")
    console.log(`http://localhost:${url.port}`);
    console.log(url);
}

void bootstrap();
