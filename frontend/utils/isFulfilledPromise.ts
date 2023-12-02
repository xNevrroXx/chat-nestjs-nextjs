function isFulfilledPromise<T>(promiseResult: PromiseSettledResult<unknown>): promiseResult is PromiseFulfilledResult<T> {
    return promiseResult.status === "fulfilled";
}

export {isFulfilledPromise};