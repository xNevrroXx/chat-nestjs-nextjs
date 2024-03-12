import { generateRandomColor } from "./generateRandomColor";

function generateRandomBrightColor() {
    let randomColor = generateRandomColor();

    while (
        randomColor.red + randomColor.green + randomColor.blue < 140 ||
        randomColor.red + randomColor.green + randomColor.blue > 510
    ) {
        randomColor = generateRandomColor();
    }

    return `rgb(${randomColor.red} ${randomColor.green} ${randomColor.blue})`;
}

export { generateRandomBrightColor };
