import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exceptions/http-exception.filter";
import { SocketIoAdapter } from "./socket.adapter";
import { ConfigService } from "@nestjs/config";
import * as passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            credentials: true,
            origin: "http://localhost:3000",
        },
    });
    const configService = app.get(ConfigService);
    app.setGlobalPrefix("api");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
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

    app.useWebSocketAdapter(new SocketIoAdapter(app, configService));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(3001);

    const url = new URL(await app.getUrl());
    console.log(`http://localhost:${url.port}`);
}

void bootstrap();
