import {
    Catch,
    ArgumentsHost,
    ExceptionFilter,
    HttpException,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        console.log("exception: ", exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response.status(status).json({
            message: (exception.getResponse() as any).message
                ? (exception.getResponse() as any).message
                : exception,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
