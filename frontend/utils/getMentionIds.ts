const REGEX = /(@)"?([a-zа-яё.&:\d]+[ ]?[a-zа-яё.&:\d]+)"?-([\S\s]+?)(?=\s+)/gim;

/**
 * Extract id of the mentioned users from the string.
 * @param {string} str - the string contains mentioned users. User mentions format: @username-ID.
 * @returns {string[]} - user's IDs
 * @example
 *  //returns ["id-1", "id-example", "1234"]
 *  getMentionIds("@example.user-id-1 @another.user-id-example @third-1234");
 * */
function getMentionIds(str: string): string[] {
    if (str.length === 0) {
        return [];
    }
    else if (str.at(-1) !== " ") {
        str = str.concat(" ");
    }

    const matches = str.matchAll(REGEX);
    const matchesArray = Array.from(matches);

    if (matchesArray.length === 0) {
        return [];
    }

    const result = new Set<string>();
    for (const match of matchesArray) {
        const id = match[3];
        result.add(id);
    }
    return Array.from(result);
}

export { getMentionIds };
