import {Command} from "../Commands/Command.js";
import {Server} from "../Server.js";

export class Application {
    _server;

    /**
     * @param {string} name
     * @param {Array<string>} argumentMap
     * @param {CallableFunction} method
     * @param {string} helpText
     * @param {null|object} context
     */
    addCommand(name, argumentMap, method, helpText, context) {
        this._server = Server.getInstance();
        new Command(name, argumentMap, method, helpText, context).add(this._server);
    }
}