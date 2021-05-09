import tmi from 'tmi.js';
import dotenv from 'dotenv';
import { CommandList } from './Commands/CommandList.js';
import { SoundPlayer } from './Applications/PlaySounds.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { Dice } from "./Applications/Dice.js";

const APPLICATIONS = [
    SoundPlayer,
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

            const result = this.handleMessage(tags.username, message);
            if (!result) {
                return;
            }
            this._client.say(channel, result);
        });
    }

    /**
     * @param {string} username
     * @param {string} message
     * @return {string|int|bool|null|undefined}
     **/
    handleMessage(username, message) {
        const commandArray = message.toLowerCase().split(' ');
        const commandPrefix = commandArray.shift();
        const command = this._commandList.getCommand(commandPrefix);
        if (!command) {
            return;
        }
        return command.call(username, commandArray);
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
                const application = APPLICATIONS[idx];
                this._applications[application.name] = new application();
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