import { Server } from "../Server.js";

export class CommandList {
    _commands = {};

    constructor() {
        this.addCommand('!commands', [], this.getHelp, 'Get me a list of commands', this);
        this.addCommand('!!commands', [], this.getSudoHelp, 'Get me a list of admin commands', this);
        this.addCommand('!help', ['commandName'], this.getHelpCommand, 'Help me with a command', this);
    }

    getHelp(username) {
        return `@${username}, available commands are: ${this.getCommands().join(", ")}`;
    }

    getSudoHelp(username) {
        if (!Server.getInstance().isAdmin(username)) {
            return `${username} Oh no you don't`;
        }

        return `@${username}, available sudo commands are: ${this.getSudoCommands().join(", ")}`;
    }

    getHelpCommand(username, commandName) {
        let command = this.getCommand(commandName);
        if (!command) {
            return `@${username}, sorry I have no idea what you are thinking of. Try !commands for a list of commands.`;
        }
        return `@${username}, the manual of ${commandName} says: ${command.helpText}. ${ command.argumentMap.length > 0 ? ('It has the following arguments: ' + command.argumentMap.join(', ')) : '' }`
    }

    getCommands() {
        return Object.keys(this._commands).filter(function (name) {
            return !name.startsWith('!!');
        });
    }

    getSudoCommands() {
        return Object.keys(this._commands).filter(function (name) {
            return name.startsWith('!!');
        });
    }

    getCommand(name) {
        if (!this._commands[name]) {
            return false;
        }
        return this._commands[name];
    }

    addCommand(name, argumentMap, method, helpText, context) {
        this._commands[name] = new Command(name, argumentMap, method, helpText, context);
    }
}

export class Command {
    name;
    argumentMap;
    method;
    helpText;
    context;

    constructor(name, argumentMap, method, helpText, context) {
        this.name = name;
        this.argumentMap = argumentMap;
        this.method = method;
        this.helpText = helpText;
        this.context = context;
    }
}