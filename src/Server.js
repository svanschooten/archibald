import tmi from 'tmi.js';
import dotenv from 'dotenv';
import { CommandList } from './Commands/CommandList.js';
import { SoundLibrary } from './Commands/PlaySounds.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { Dice } from "./Commands/Dice.js";

const APPLICATIONS = [
    SoundLibrary,
    Dice
];

export class Server {
    _commandList = null;
    _client = null;
    _admins = [];
    _applications = {};
    static _instance = null;


    constructor() {
        if (process.env.NODE_ENV !== 'production') {
            dotenv.config();
        }

        this._client = new tmi.Client({
            options: { debug: true, messagesLogLevel: "info" },
            connection: { reconnect: true, secure: true },
            identity: { username: process.env.BOT_USERNAME, password: process.env.OAUTH_TOKEN },
            channels: [ process.env.CHANNEL_NAME ]
        });

        const admins = yaml.load(fs.readFileSync('./resources/config/admins.yaml'));
        for (let idx in admins.admins) {
            if (admins.admins.hasOwnProperty(idx)) {
                const admin = admins.admins[idx];
                this.addAdmin(admin.name);
            }
        }

        this._commandList = CommandList.getInstance();
    }

    /** @return {void} */
    start() {
        this.loadApplications();
        this._commandList.importAliases();

        this._client.connect().catch(console.error);
        this._client.on('message', (channel, tags, message, self) => {
            if(self) return;

            const result = this.handleMessage(message, tags.username);
            if (!result) {
                return;
            }
            this._client.say(channel, result);
        });
    }

    /**
     * @param {string} message
     * @param {string} username
     * @return {string|int|bool|null|undefined}
     **/
    handleMessage(message, username) {
        const commandArray = message.toLowerCase().split(' ');
        const commandPrefix = commandArray.shift();
        const command = this._commandList.getCommand(commandPrefix);
        if (!command) {
            return;
        }
        return command.method.apply(command.context, [username].concat(commandArray));
    }


    /**
     * @param {string} username
     * @return {boolean}
     **/
    isAdmin(username) {
        return this._admins.includes(username.toLowerCase());
    }

    /**
     * @param {string} username
     * @return {int|null|undefined}
     **/
    addAdmin(username) {
        if (this.isAdmin(username)) {
            return;
        }
        return this._admins.push(username.toLowerCase());
    }

    /** @returns {Server} */
    static getInstance() {
        if (! Server._instance) {
            Server._instance = new Server();
        }
        return Server._instance;
    }

    /** @return {void} */
    loadApplications() {
        for (let idx in APPLICATIONS) {
            if (APPLICATIONS.hasOwnProperty(idx)) {
                const Application = APPLICATIONS[idx];
                this._applications[Application.name] = new Application();
            }
        }
    }

    /**
     * @param {string} name
     * @return {*}
     */
    getApplication(name) {
        return this._applications[name];
    }
}