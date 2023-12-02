const URL_REGEX = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/g;
const URL_COMBINED_REGEX = /(?<!=)(?<!^)(?=https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/g;

function findLinksInText(text: string): string[] {
    if (!text) return [];
    const links = [];
    const matches = text.matchAll(URL_REGEX);

    for (const match of matches) {
        const maybeCombinedUrls = match[0];
        const sliced = maybeCombinedUrls.split(URL_COMBINED_REGEX);
        links.push(...parseCombined(sliced));
    }

    return links;
}

function parseCombined(links: string[]): string[] {
    const newLinks = [];
    for (const link of links) {
        const sliced = link.split(URL_COMBINED_REGEX);
        if (sliced.length > 1) {
            newLinks.push(...parseCombined(sliced));
        }
        else {
            newLinks.push(link);
        }
    }
    return newLinks;
}

export {findLinksInText};