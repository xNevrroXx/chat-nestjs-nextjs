import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    serializeUser(user: any, done: (error: Error, user: any) => void): any {
        done(null, { id: user.id });
    }

    deserializeUser(
        payload: any,
        done: (error: Error, user: any) => void
    ): any {
        done(null, payload);
    }
}
