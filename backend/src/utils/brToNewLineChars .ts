function brToNewLineChars(text: string) {
    return text.replace(/<\/?br\s*\/?>/gm, "\n");
}

export { brToNewLineChars };
