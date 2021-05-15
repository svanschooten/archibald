import {Server} from "../Server.js";

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
        if (name.includes(' ')) throw Error('Commands cannot have spaces in their names');

        this.name = name;
        this.argumentMap = argumentMap;
        this.method = method;
        this.helpText = helpText;
        this.context = context;
        if (this.name.startsWith('!!')) {
            this.sudo = true;
        }
    }

    /** @param {Server|null|undefined} [server] */
    add(server) {
        if (server) {
            server.getCommandsList().addCommand(this.name, this);
            return;
        }
        Server.getInstance().getCommandsList().addCommand(this.name, this);
    }

    /**
     * @param {string} username
     * @param {array} otherArgs
     * @return {string|null}
     */
    call(username, otherArgs) {
        if (this.sudo && !Server.getInstance().isAdmin(username)) {
            return `${username} Oh no you don't`;
        }
        return this.method.apply(this.context, [username].concat(otherArgs));
    }
}