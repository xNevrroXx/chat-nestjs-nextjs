import {ROUTES} from "../router/routes.ts";

type TRouteArgs =
    | { path: ROUTES.AUTH }
    | { path: ROUTES.MAIN }
    ;
type TRouteWithParams = {path: ROUTES, params: TRouteArgs};

export {type TRouteArgs, type TRouteWithParams};