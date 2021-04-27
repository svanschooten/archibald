import tmi from 'tmi.js';
import dotenv from 'dotenv';
import { CommandList } from './Commands/CommandList.js';
import { SoundLibrary } from './Commands/PlaySounds.js';
import yaml from 'js-yaml';
import fs from 'fs';

export class Server {
    _commandList = null;
    _client = null;
    _admins = [];
    static _instance = null;

    constructor() {
        if (process.env.NODE_ENV !== 'production') {
            dotenv.config();
        }

        this._client = new tmi.Client({
            options: { debug: true, messagesLogLevel: "info" },
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN
            },
            channels: [ process.env.CHANNEL_NAME ]
        });

        const admins = yaml.load(fs.readFileSync('./resources/storage/admins.yaml'));
        for (let idx in admins.admins) {
            if (admins.admins.hasOwnProperty(idx)) {
                const admin = admins.admins[idx];
                this.addAdmin(admin.name);
            }
        }

        this._commandList = new CommandList();
        this._soundLibrary = new SoundLibrary(this._commandList);
    }

    start() {
        this._client.connect().catch(console.error);
        this._client.on('message', (channel, tags, message, self) => {
            if(self) return;
            const commandArray = message.toLowerCase().split(' ');
            const commandPrefix = commandArray.shift();
            const command = this._commandList.getCommand(commandPrefix);
            if (!command) {
                return;
            }
            const result = command.method.apply(command.context, [tags.username].concat(commandArray));
            if (!result) {
                return;
            }
            this._client.say(channel, result);
        });
    }

    isAdmin(username) {
        return this._admins.includes(username.toLowerCase());
    }

    getCommandsList() {
        return this._commandList;
    }

    addAdmin(username) {
        if (this.isAdmin(username)) {
            return;
        }
        return this._admins.push(username.toLowerCase());
    }

    static getInstance() {
        if (! this._instance) {
            this._instance = new Server();
        }
        return this._instance;
    }
}