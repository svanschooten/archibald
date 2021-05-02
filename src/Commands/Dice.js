import { CommandList } from "./CommandList.js";
import create from 'random-seed';

export class Dice {
    _seed;
    static name = 'dice';

    /** @param {int|null} seed */
    constructor(seed = null) {
        if (!seed) {
            seed = Math.random();
        }
        this._seed = seed;
        this._generator = create(this._seed);

        const commandsList = CommandList.getInstance();
        commandsList.addCommand('!roll', ['min', 'max'],  this.roll, 'Roll the dice! Min and max default to 1 and 20', this);
    }

    /**
     * @param {string} username
     * @param {int} min
     * @param {int} max
     * @return {string}
     */
    roll(username, min = 1, max = 20) {
        return `@${username} rolled a: ${this._generator.intBetween(min, max)}`;
    }

    /** @return {int|null} */
    getSeed() {
        return this._seed;
    }
}