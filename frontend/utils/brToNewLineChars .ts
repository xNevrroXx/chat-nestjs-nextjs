function brToNewLineChars(text: string) {
    return text.replace(/<\/?br\s*\/?>/mg, "\n");
}

export {brToNewLineChars};