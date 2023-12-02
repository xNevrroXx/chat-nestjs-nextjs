import {type TRouteArgs, TRouteWithParams} from "@/router/TRouteArgs";

function isRouteWithParams(a: TRouteArgs): a is TRouteWithParams {
    return Object.prototype.hasOwnProperty.call(a, "params");
}

/**
 * Allows you to create the path using a convenient approach
 * @example
 * //returns "user/10"
 * createRoute({path: "user/:userId", params?: {userId: 10}};
 * @param {TRouteArgs} args - an object of the {path: "user/:userId", params?: {userId: 10}} type;
 */
function createRoute(args: TRouteArgs) {
    if (!isRouteWithParams(args)) return args.path;

    return Object.entries(args)
        .reduce<string>((accum, [param, value]) =>
                accum.replace(`:${param}`, String(value)),
            args.path
        );
}

export {createRoute};