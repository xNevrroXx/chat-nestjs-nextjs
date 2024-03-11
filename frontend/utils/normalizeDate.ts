const DATE_FORMATTER_FULL_DATE = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
    year: "numeric",
});
const DATE_FORMATTER_WITH_MONTH = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "long",
});
const DATE_FORMATTER_ONLY_TIME = new Intl.DateTimeFormat("ru", {
    timeStyle: "short",
});

function normalizeDate(
    type: "short time" | "full date" | "auto date",
    inputDate: string | Date,
) {
    const currentDate = new Date();

    const date = inputDate instanceof Date ? inputDate : new Date(inputDate);

    switch (type) {
        case "auto date": {
            if (date.getFullYear() !== currentDate.getFullYear()) {
                return DATE_FORMATTER_FULL_DATE.format(date);
            }
            else {
                return DATE_FORMATTER_WITH_MONTH.format(date);
            }
        }
        case "short time": {
            return DATE_FORMATTER_ONLY_TIME.format(date);
        }
        case "full date": {
            return DATE_FORMATTER_FULL_DATE.format(date);
        }
    }
}

export { normalizeDate };
