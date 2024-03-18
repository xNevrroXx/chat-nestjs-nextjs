interface IParams {
    // string value which will be sliced
    name: string;
    // count of the max letters in the sliced name
    maxLetters?: number;
    // delimiter for name trimming
    delimiter?: string | RegExp;
}

/**
 * @typedef {Object} Params
 * @param {string} name - string value which will be sliced.
 * @param {number} [maxLetters=2] - count of the max letters in the sliced name.
 * @param {string|regex} [delimiter=" "] - delimiter for name trimming.
 * */

/**
 * Get name initials sliced by delimiter
 * @param {Params} params - the input object
 * @returns {string} initials
 *
 * @example
 * // returns "JP"
 * getInitials({
 *     name: "John Peterson",
 *     maxLetters: 2
 * });
 * @example
 * // returns "ed"
 * getInitials({
 *     name: "email@domain.com",
 *     maxLetters: 2,
 *     delimiter: "@"
 * });
 * @example
 * // returns "o"
 * getInitials({
 *     name: "one.letter",
 *     maxLetters: 3,
 *     delimiter: "@"
 * });
 * */
function getNameInitials({
    name: inputName,
    maxLetters = 2,
    delimiter = " ",
}: IParams): string {
    if (!inputName || inputName.length <= 1) {
        return inputName;
    }

    const name = inputName.trim();

    let result = "";
    const sliced = name.split(delimiter);
    for (let i = 0; i < maxLetters && sliced.length >= i + 1; i++) {
        const letter = sliced[i][0];
        result = result.concat(letter);
    }
    return result.toUpperCase();
}

export { getNameInitials };
