function checkIsFulfilledPromise<T>(
    promiseResult: PromiseSettledResult<unknown>,
): promiseResult is PromiseFulfilledResult<T> {
    return promiseResult.status === "fulfilled";
}

export { checkIsFulfilledPromise };
