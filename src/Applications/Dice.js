import {Application} from "./Application.js";

export class Dice extends Application {
    constructor() {
        super();
        this.addCommand('!roll', ['min', 'max'],  this.roll, 'Roll the dice! Min and max default to 1 and 20', this);
    }

    /**
     * @param {string} username
     * @param {int|string} min
     * @param {int|string} max
     * @return {string}
     */
    roll(username, min = 1, max = 20) {
        let minValue = min instanceof Number ? min : parseInt(min),
            maxValue = max instanceof Number ? max : parseInt(max);
        const range = maxValue - minValue + 1;
        let modString = null;
        if (minValue !== 1) {
            const diff = minValue - 1;
            modString = diff > 0 ? '+' + diff : diff.toString();
        }
        return `@${username} rolled a ${Math.floor(Math.random() * range) + minValue} with a D${range}${modString ? ` and modifier ${modString} ` : ''}!`;
    }
}