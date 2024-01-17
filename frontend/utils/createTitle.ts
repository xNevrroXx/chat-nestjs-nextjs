const MAIN_TITLE = process.env.MAIN_TITLE as string;

function createTitle(subTitle: string): string {
    return MAIN_TITLE.concat(" | ").concat(subTitle);
}

export { createTitle };
