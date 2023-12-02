import highlight from "highlight.js";

const REGEX = /^(`{3})([a-z0-9+]*$)([\S\s]+?)(^\1$)/gim;

/**
 * Finds and replaces the Markdown code blocks with HTML code blocks(pre > code > ...found code block...).<br\>
 * Also add a highlight to the code using "highlight.js" npm package.
 * @param {string} text - a text that possible contains blocks of Markdown code
 * @return {string}     - a new string containing HTML tags.
 * */
function codeBlocksToHTML(text: string): string {
    if (!text) return text;
    let resultHTML = "";
    const prevEndMatchesIndexes = {
        textIndex: 0,
        htmlIndex: 0,
    };

    const matches = text.matchAll(REGEX);
    const matchArray = Array.from(matches);
    if (!matchArray.length) {
        // if there is no code sections in the input text
        return text;
    }

    for (const match of matchArray) {
        // add plain text to the resulting string.
        resultHTML += text.slice(prevEndMatchesIndexes.textIndex, match.index);
        prevEndMatchesIndexes.htmlIndex +=
            match.index - prevEndMatchesIndexes.textIndex;
        prevEndMatchesIndexes.textIndex = match.index + 1;

        // add HTML code blocks to the resulting string.
        const language = match[2];
        const extractedCode = match[3].trim();
        if (!extractedCode.length) {
            continue;
        }
        const highlightedCode = language
            ? highlight.highlight(extractedCode, { language })
            : highlight.highlightAuto(extractedCode);

        const codeWithWrapper =
            "<pre>" +
            "<div class='code-block-header' title='copy'>" +
            `<span>${language ? language : "copy"}</span>` +
            "<svg width='112' height='124' viewBox='0 0 112 124' fill='none'>" +
            "<path d='M29.2174 0C13.0811 0 0 13.0628 0 29.1765V82.6667C0 92.4847 4.85623 101.17 12.3009 106.458C11.4298 103.956 10.9565 101.269 10.9565 98.4706V35.2549C10.9565 21.8268 21.8574 10.9412 35.3043 10.9412H84C86.802 10.9412 89.4935 11.4138 91.9988 12.2837C86.7032 4.84942 78.0057 0 68.1739 0H29.2174Z' fill='#52789C' fill-opacity='0.86'/>" +
            "<rect x='20.6956' y='20.6667' width='91.3043' height='103.333' rx='12' fill='#52789C' fill-opacity='0.86'/>" +
            "</svg>" +
            "</div>" +
            `<code class="hljs ${
                language && "language-" + language.toLowerCase()
            }">` +
            highlightedCode.value +
            "</code>" +
            "</pre>";
        resultHTML += codeWithWrapper;
        prevEndMatchesIndexes.htmlIndex += codeWithWrapper.length;
        prevEndMatchesIndexes.textIndex += match[0].length;
    }
    if (prevEndMatchesIndexes.textIndex < text.length) {
        resultHTML += text.slice(prevEndMatchesIndexes.textIndex, text.length);
    }

    return resultHTML;
}

export { codeBlocksToHTML };
