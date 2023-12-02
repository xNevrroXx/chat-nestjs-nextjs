export function excludeSensitiveFields<Data, Key extends keyof Data>(
    obj: Data,
    keys: Key[]
): Omit<Data, Key> {
    const result: Data = {} as Data;
    for (const key of Object.keys(obj) as Key[]) {
        if (keys.includes(key)) {
            continue;
        }

        result[key] = obj[key];
    }

    return result;
}