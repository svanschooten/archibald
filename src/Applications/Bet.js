import {Application} from "./Application.js";
import {TwitchClient} from "../Clients/Twitch.js";
import {StorageFactory} from "../Storage/StorageFactory.js";
import {FileStorage} from "../Storage/FileStorage.js";

export class Bet extends Application {
    _hasActiveBet = false;
    _activeBetTitle = '';
    _activeBetters = {};
    _config;
    _streaks;
    _storage;

    /** @param {object} config */
    constructor(config) {
        super();
        this._config = config;
        this._storage = StorageFactory.create(FileStorage.TYPE, this._config.storage);
        const streakString = this._storage.load();
        if (streakString === false) {
            this._streaks = {};
        } else {
            this._streaks = JSON.parse(streakString);
        }

        this.addCommand('!bet', ['command', 'command arguments'], this.bet, 'Roll the dice! Min and max default to 1 and 20', this);
        this.addCommand('!!bet', ['command', 'command arguments'], this.sudoBet, 'Roll the dice! Min and max default to 1 and 20', this);
    }

    /**
     * @param {string} username
     * @param {string} command
     * @param {string} commandArguments
     * @return {string}
     */
    bet(username, command, ...commandArguments) {
        switch (command.toLowerCase()) {
            case 'active':
                return this.active();
            case 'yes':
                return this.applyBet(username, true);
            case 'no':
                return this.applyBet(username, false);
            case 'my':
                return this.getBet(username);
            case 'streak':
                return this.getStreak(username);
            default:
                return this.help();
        }
    }

    /** @return {string} */
    help() {
        return "Betting options are 'active', 'yes', 'no', 'my' and 'streak'."
    }

    /**
     * @param {string} username
     * @param {string} command
     * @param {string} commandArguments
     * @return {string}
     */
    sudoBet(username, command, ...commandArguments) {
        switch (command.toLowerCase()) {
            case 'open':
                return this.open(commandArguments.join(' '));
            case 'close':
                return this.close();
            case 'win':
                return this.betEnded(true);
            case 'lose':
                return this.betEnded(false);
            default:
                return this.sudoHelp();
        }
    }

    /** @return {string} */
    sudoHelp() {
        return "Sudo betting options are 'open', 'close', 'win' and 'lose'."
    }

    /** @return {string} */
    active() {
        return 'There is ' + (this._hasActiveBet ? 'an' : 'no') + ' active bet right now' + (this._hasActiveBet ? ': ' + this._activeBetTitle : '');
    }

    /**
     * @param {string} title
     */
    open(title) {
        this._activeBetters = {};
        this._activeBetTitle = title;
        this._hasActiveBet = true;
        return 'Bet is now open: ' + this._activeBetTitle;
    }

    /** @return {string} */
    close() {
        const twitchClient = this._server.getClient(TwitchClient.NAME);
        let response = 'Bet is closed!';
        if (twitchClient instanceof TwitchClient) {
            twitchClient.clear();
            response = response + ' And chat has been cleared';
        }

        return response;
    }

    /**
     * @param {string} username
     * @param {boolean} bet
     */
    applyBet(username, bet) {
        if (!this._hasActiveBet) {
            return `@${username} no bet active right now`;
        }

        this._activeBetters[username] = bet;
        return `@${username} locked in your bet: ${bet ? 'yes' : 'no'}`;
    }

    /**
     * @param username
     * @return {string}
     */
    getBet(username) {
        if (this._hasActiveBet && this._activeBetters.hasOwnProperty(username)) {
            return `@${username} you bet ${this._activeBetters[username] ? 'yes' : 'no'}`;
        }
        return `@${username} you have not bet`;
    }

    /**
     * @param username
     * @return {string}
     */
    getStreak(username) {
        if (this._streaks.hasOwnProperty(username)) {
            return `@${username} your current streak is at ${this._streaks[username]}`;
        }
        return `@${username} you have not streak yet`;
    }

    /**
     * @param {boolean} success
     * @return {string|null|undefined}
     */
    betEnded(success) {
        if (!this._hasActiveBet) return;
        this._hasActiveBet = false;

        for (const username of Object.keys(this._activeBetters)) {
            if (success === this._activeBetters[username]) {
                this._streaks[username] = (this._streaks.hasOwnProperty(username) ? this._streaks[username] : 0) + 1;
                continue;
            }
            this._streaks[username] = -1;
        }
        this._storage.store(JSON.stringify(this._streaks));

        if (success) {
            return `I won! And with me ${Object.keys(this._activeBetters).filter((username) => this._activeBetters[username] === true).map((username) => `@${username}`).join(', ')}!`
        }
        return `I lost... And with that we have the following winners: ${Object.keys(this._activeBetters).filter((username) => this._activeBetters[username] === false).map((username) => `@${username}`).join(', ')}`;
    }
}