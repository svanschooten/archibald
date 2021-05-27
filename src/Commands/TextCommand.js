import {Command} from "./Command.js";
import {BuiltInCommand} from "./BuiltInCommand.js";
import util from 'util';

export class TextCommand extends BuiltInCommand{
    static TYPE = 'Text';

    /**
     * @param {object} config
     */
    static create(config) {
        new Command(config.command, [], function (username) {
            if (!config.hasOwnProperty('template')) {
                throw Error('Text commands require a template in the config!');
            }
            return util.format(config.template, username);
        }, config.helpText, null).add();
    }
}