import {Command} from "../Commands/Command.js";

export class Application {
    /**
     * @param {string} name
     * @param {Array<string>} argumentMap
     * @param {CallableFunction} method
     * @param {string} helpText
     * @param {null|object} context
     */
    addCommand(name, argumentMap, method, helpText, context) {
        new Command(name, argumentMap,  method, helpText, context).add();
    }
}