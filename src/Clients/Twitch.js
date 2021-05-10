import tmi from "tmi.js";
import { Server } from "../Server.js";
import { Client } from './Client.js';

export class TwitchClient extends Client {
    _client;
    _configuration;
    _server;
    _commandsList;

    constructor(configuration) {
        super();
        this._configuration = configuration;
        this._server = Server.getInstance();
        this._commandsList = this._server.getCommandsList();
        this._client = new tmi.Client({
            options: { debug: this._configuration.debug, messagesLogLevel: this._configuration.debug ? "info" : "warning" },
            connection: { reconnect: true, secure: true },
            identity: { username: this._configuration.username ?? process.env.BOT_USERNAME, password: this._configuration.token ?? process.env.OAUTH_TOKEN },
            channels: this._configuration.channels ?? [ process.env.CHANNEL_NAME ]
        });
    }

    async connect() {
        await this._client.connect();
        this._client.on('message', this._handleMessage.bind(this));
    }

    /**
     * @param {string} channel
     * @param {object} tags
     * @param {string} message
     * @param {bool} self
     */
    _handleMessage(channel, tags, message, self) {
        if(self) return;

        const commandArray = message.toLowerCase().split(' ');
        const commandPrefix = commandArray.shift();
        const command = this._commandsList.getCommand(commandPrefix);

        if (!command) return;

        const result = command.call(tags.username, commandArray);
        if (!result) return;

        this._client.say(channel, result);
    }
}