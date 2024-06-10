import { ROUTES } from "@/router/routes";

type TRouteArgs =
    | { path: ROUTES.AUTH }
    | { path: ROUTES.REGISTER }
    | { path: ROUTES.MAIN };
type TRouteWithParams = { path: ROUTES; params: TRouteArgs };

export { type TRouteArgs, type TRouteWithParams };
