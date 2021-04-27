import tmi from 'tmi.js';
import dotenv from 'dotenv';
import { CommandList } from './Commands/CommandList.js';
import { SoundLibrary } from './Commands/PlaySounds.js';

export class Server {
    _commandList;
    _client;
    static _instance;

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

    getCommandsList() {
        return this._commandList;
    }

    static getInstance() {
        if (! this._instance) {
            this._instance = new Server();
        }
        return this._instance;
    }
}