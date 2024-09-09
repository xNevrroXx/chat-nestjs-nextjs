interface ICutTheTextParams {
    text: string;
    maxLength: number;
    /**
     * If it's false - it cut off the text, regardless spaces.<br>
     * @example
     * // returns "hello, my..."
     * truncateTheText("hello, my name is John", 12, true);
     * @example
     * // returns "hello, my na..."
     * truncateTheText("hello, my name is John", 12, false);
     * @default: true
     * @returns {String} Returns the truncated string.
     **/
    cutCloseToLastSpace?: boolean;
    /**
     * Trim spaces around the text.
     * @default: true
     * */
    trim?: boolean;
    /**
     * If it's file, it can cut off the text. except for the part with the *extension*.
     * @example
     * // returns "a-really.txt"
     * truncateTheText("a-really-long-name-of-the-file.txt", 11, false);
     * @default true
     * */
    isFileName?: boolean;
}

export const truncateTheText = ({
    text: inputText,
    maxLength,
    cutCloseToLastSpace = true,
    trim = true,
    isFileName = false,
}: ICutTheTextParams): string => {
    const text = trim ? inputText.trim() : inputText;
    if (!text || text.length < maxLength - 1) {
        return text;
    }

    let result: string;
    let extension: string;
    if (!isFileName) {
        result = text.slice(0, maxLength);
    }
    else {
        const regex = /(.+)(\.[a-z]+)$/;
        const resultRegex = regex.exec(text);
        if (!resultRegex) {
            return text;
        }

        extension = resultRegex[2];
        result = result = resultRegex[1].slice(0, maxLength);
    }

    if (!cutCloseToLastSpace) {
        if (isFileName) {
            result += extension!;
            return result;
        }
        return result.concat("...");
    }

    const regexLastLetterBeforeSpace = /.(?=\s)/g;
    let m: RegExpExecArray | null = null;
    let lastMatch: RegExpExecArray | null = null;
    do {
        const pastMatch = m;
        m = regexLastLetterBeforeSpace.exec(result);

        if (!m) {
            lastMatch = pastMatch;
            break;
        }
    } while (m);

    if (!lastMatch) {
        if (isFileName) {
            result += extension!;
            return result;
        }
        else {
            return result.concat("...");
        }
    }

    result = result.slice(0, lastMatch.index + 1).concat("...");
    if (isFileName) {
        result += extension!;
    }

    return result;
};
