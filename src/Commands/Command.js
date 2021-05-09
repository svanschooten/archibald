import { Server } from "../Server.js";
import { CommandList } from "./CommandList.js";

export class Command {
    name;
    argumentMap;
    method;
    helpText;
    context;
    sudo = false;

    /**
     * @param {string} name
     * @param {Array<string>} argumentMap
     * @param {CallableFunction} method
     * @param {string} helpText
     * @param {null|object} context
     */
    constructor(name, argumentMap, method, helpText, context) {
        this.name = name;
        this.argumentMap = argumentMap;
        this.method = method;
        this.helpText = helpText;
        this.context = context;
        if (this.name.startsWith('!!')) {
            this.sudo = true;
        }
    }

    add() {
        CommandList.getInstance().addCommand(this.name, this);
    }

    call(username, ...otherArgs) {
        if (this.sudo && !Server.getInstance().isAdmin(username)) {
            return `${username} Oh no you don't`;
        }
        return this.method.apply(this.context, [username].concat(otherArgs));
    }
}