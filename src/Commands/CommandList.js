import {Command} from "./Command.js";
import yaml from "js-yaml";
import fs from "fs";

export class CommandList {
    static _instance = null;
    _commands = {};

    constructor() {
        this.addCommand('!commands', new Command('!commands', [], this.getHelp, 'Get me a list of commands', this));
        this.addCommand('!!commands', new Command('!!commands', [], this.getSudoHelp, 'Get me a list of admin commands', this));
        this.addCommand('!help', new Command('!help', ['commandName'], this.getHelpCommand, 'Help me with a command', this));
    }

    /**  @returns {CommandList} */
    static getInstance() {
        if (!CommandList._instance) {
            CommandList._instance = new CommandList();
        }
        return CommandList._instance;
    }

    /**
     * @param {string} username
     * @returns {string}
     */
    getHelp(username) {
        return `@${username}, available commands are: ${this.getCommands().join(", ")}`;
    }

    /**
     * @param {string} username
     * @returns {string}
     */
    getSudoHelp(username) {
        return `@${username}, available sudo commands are: ${this.getSudoCommands().join(", ")}`;
    }

    /**
     * @param {string} username
     * @param {string} commandName
     * @returns {string}
     */
    getHelpCommand(username, commandName) {
        let command = this.getCommand(commandName);
        if (!command) {
            return `@${username}, sorry I have no idea what you are thinking of. Try !commands for a list of commands.`;
        }
        return `@${username}, the manual of ${commandName} says: ${command.helpText}. ${command.argumentMap.length > 0 ? ('It has the following arguments: ' + command.argumentMap.join(', ')) : ''}`
    }

    /** @returns {array<string>} */
    getCommands() {
        return Object.keys(this._commands).filter(this._isNotSudoCommand.bind(this));
    }

    /** @returns {array<string>} */
    getSudoCommands() {
        return Object.keys(this._commands).filter(this._isSudoCommand.bind(this));
    }

    /**
     * @param {string} command
     * @returns {boolean}
     * @private
     */
    _isSudoCommand(command) {
        return command.startsWith('!!');
    }

    /**
     * @param {string} command
     * @returns {boolean}
     * @private
     */
    _isNotSudoCommand(command) {
        return !this._isSudoCommand(command);
    }

    /**
     * @param {string} name
     * @returns {boolean|Command}
     */
    getCommand(name) {
        if (!this._commands[name]) {
            return false;
        }
        return this._commands[name];
    }

    /**
     * @param {string} name
     * @param {Command} command
     */
    addCommand(name, command) {
        this._commands[name] = command;
    }

    /** @param {string} aliasConfigPath */
    importAliases(aliasConfigPath) {
        const aliases = yaml.load(fs.readFileSync(aliasConfigPath));
        for (let idx in aliases.aliases) {
            if (aliases.aliases.hasOwnProperty(idx)) {
                const alias = aliases.aliases[idx];
                const command = this.getCommand(alias.command);
                if (!command) {
                    console.error('Alias ' + alias.alias + ' for non-existing command ' + alias.command);
                    continue;
                }
                new Command(
                    alias.alias,
                    command.argumentMap,
                    function (username, ...otherArgs) {
                        return command.method.apply(command.context, [username].concat(alias.arguments).concat(otherArgs));
                    },
                    command.helpText,
                    command.context
                ).add();
            }
        }
    }
}