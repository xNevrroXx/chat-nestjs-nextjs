interface ICutTheTextParams {
    text: string,
    maxLength: number,
    /**
     * If it's false - it cut off the text, regardless spaces.<br>
     * **Example 1**: truncateTheText("hello, my name is John", 12, true);<br>
     * Output 1: "hello, my...".<br>
     * **Example 2**: truncateTheText("hello, my name is John", 12, false);<br>
     * Output 2: "hello, my na...".
     */
    cutCloseToLastSpace?: boolean,
    /**
     * Default: true
    * */
    trim?: boolean
}

export const truncateTheText = ({text: inputText, maxLength, cutCloseToLastSpace = true, trim = true}: ICutTheTextParams): string => {
    const text = trim ? inputText.trim() : inputText;
    if (!text || text.length < maxLength - 1) {
        return text;
    }

    let result = text.slice(0, maxLength);
    if (!cutCloseToLastSpace) {
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
    } while(m);


    if (!lastMatch) {
        return result.concat("...");
    }

    result = result.slice(0, lastMatch.index + 1).concat("...");

    return result;
};