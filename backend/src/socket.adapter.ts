/* eslint-disable @typescript-eslint/no-explicit-any */

import { INestApplicationContext } from "@nestjs/common";
import { isFunction, isNil } from "@nestjs/common/utils/shared.utils";
import { MessageMappingProperties } from "@nestjs/websockets";
import { DISCONNECT_EVENT } from "@nestjs/websockets/constants";
import { fromEvent, Observable } from "rxjs";
import { filter, first, map, mergeMap, share, takeUntil } from "rxjs/operators";
import { Server, ServerOptions } from "socket.io";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ConfigService } from "@nestjs/config";
import {
    IClientToServerEvents,
    IServerToClientEvents,
} from "./chat/socket.models";

// TODO: Using this until socket.io v3 is part of Nest.js, see: https://github.com/nestjs/nest/issues/5676
export class SocketIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext,
        private configService: ConfigService
    ) {
        super(app);
    }

    public create(
        port: number,
        serverOptions?: ServerOptions & { namespace?: string; server: any }
    ): any {
        if (!serverOptions) {
            return this.createIOServer(port);
        }
        const { namespace, server, ...opt } = serverOptions;
        return server && isFunction(server.of)
            ? server.of(namespace)
            : namespace
            ? this.createIOServer(port, opt).of(namespace)
            : this.createIOServer(port, opt);
    }

    public createIOServer(port: number, serverOptions?: ServerOptions): any {
        if (this.httpServer && port === 0) {
            const s = new Server<IClientToServerEvents, IServerToClientEvents>(
                this.httpServer,
                {
                    cookie: true,
                    cors: {
                        origin: "*",
                        credentials: true,
                    },
                    // Allow 100MB of data per request.
                    maxHttpBufferSize: 1e8,
                }
            );

            return s;
        }
        return new Server<IClientToServerEvents, IServerToClientEvents>(
            port,
            serverOptions
        );
    }

    public bindMessageHandlers(
        client: any,
        handlers: MessageMappingProperties[],
        transform: (data: any) => Observable<any>
    ) {
        const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
            share(),
            first()
        );

        handlers.forEach(({ message, callback }) => {
            const source$ = fromEvent(client, message).pipe(
                mergeMap((payload: any) => {
                    const { data, ack } = this.mapPayload(payload);
                    return transform(callback(data, ack)).pipe(
                        filter((response: any) => !isNil(response)),
                        map((response: any) => [response, ack])
                    );
                }),
                takeUntil(disconnect$)
            );
            source$.subscribe(([response, ack]) => {
                if (response.event) {
                    return client.emit(response.event, response.data);
                }
                isFunction(ack) && ack(response);
            });
        });
    }

    public mapPayload(payload: any): { data: any; ack?: () => any } {
        if (!Array.isArray(payload)) {
            return { data: payload };
        }
        const lastElement = payload[payload.length - 1];
        const isAck = isFunction(lastElement);
        if (isAck) {
            const size = payload.length - 1;
            return {
                data: size === 1 ? payload[0] : payload.slice(0, size),
                ack: lastElement,
            };
        }
        return { data: payload };
    }
}
