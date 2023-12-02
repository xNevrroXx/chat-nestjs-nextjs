import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Server } from "socket.io";

@Catch(HttpException)
export class WsExceptionFilter implements ExceptionFilter {
    catch(exception: WsException | HttpException, host: ArgumentsHost) {
        const client = host.switchToWs().getClient() as Server;
        const data = host.switchToWs().getData();
        const error =
            exception instanceof WsException
                ? exception.getError()
                : exception.getResponse();

        const details =
            error instanceof Object ? { ...error } : { message: error };

        client.emit(
            JSON.stringify({
                event: "error",
                data: {
                    id: (client as any).id,
                    rid: data.rid,
                    ...details,
                },
            })
        );
    }
}
