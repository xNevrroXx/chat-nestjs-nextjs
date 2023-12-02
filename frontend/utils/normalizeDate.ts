const DATE_FORMATTER_FULL_DATE = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric"
});
const DATE_FORMATTER_WITH_MONTH = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric"
});
const DATE_FORMATTER_ONLY_TIME = new Intl.DateTimeFormat("ru", {
    timeStyle: "short"
});

function normalizeDate(inputDate?: string | Date) {
    if (!inputDate) {
        return DATE_FORMATTER_FULL_DATE.format(new Date());
    }
    const currentDate = new Date();

    const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
    if (date.getFullYear() !== currentDate.getFullYear()) {
        return DATE_FORMATTER_FULL_DATE.format(date);
    }
    else if ( date.getMonth() !== currentDate.getMonth() || date.getDate() !== currentDate.getDate() ) {
        return DATE_FORMATTER_WITH_MONTH.format(date);
    }

    return DATE_FORMATTER_ONLY_TIME.format(date);
}

export {normalizeDate};