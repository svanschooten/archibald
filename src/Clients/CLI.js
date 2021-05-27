import {Client} from './Client.js';
import {Server} from "../Server.js";
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';

export class CLIClient extends Client {
    static NAME = 'CLI';
    _color;
    _commandsList;

    constructor(config) {
        super();

        this._color = config?.color ?? 'yellow';
        this._commandsList = Server.getInstance().getCommandsList();
    }

    async connect() {
        console.log(
            chalk.yellow(
                figlet.textSync('Archibald, chat bat', { horizontalLayout: 'full' })
            )
        );
        this._waitForInput();
    }

    /**
     * @private
     */
    async _waitForInput() {
        const {response} = await inquirer.prompt([{
            name: 'response',
            type: 'input',
            message: 'Enter your command:',
            validate: function (value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter a valid command.';
                }
            }
        }]);

        const commandArray = response.split(' ');
        const commandPrefix = commandArray.shift().toLowerCase();
        const command = this._commandsList.getCommand(commandPrefix);

        if (!!command) {
            const result = command.call('user', commandArray);
            if (!!result) {
                let text = result;
                if (chalk.hasOwnProperty(this._color)) {
                    text = chalk[this._color](result);
                }
                console.log(text);
            }
        }

        this._waitForInput();
    }
}