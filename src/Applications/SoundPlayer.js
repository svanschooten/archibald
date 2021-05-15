import play from 'audio-play';
import load from 'audio-loader';
import yaml from 'js-yaml';
import fs from 'fs';
import {Application} from "./Application.js";

export class SoundPlayer extends Application {
    static defaultSoundConfigPath = './resources/config/sounds.yaml';
    _sounds = {};
    _muted = false;
    _mutedEndTime = 0;
    _muteTimeout = null;
    _soundConfigPath;
    _configuration;
    _mute_duration = 1000 * 60 * 2;
    _soundsPath = './resources/sounds/';

    /**
     * @param {object} config
     */
    constructor(config) {
        super();
        this._soundsPath = config.paths.sounds;
        this._soundConfigPath = config.paths.config;
        if (!fs.existsSync(this._soundConfigPath)) {
            this._soundConfigPath = SoundPlayer.defaultSoundConfigPath;
        }
        if (config.hasOwnProperty('mute_duration')) {
            this._mute_duration = config.mute_duration;
        }

        this._loadConfiguration();
        this._loadSounds();

        this.addCommand('!playsound', ['soundName'], this.play, 'Plays a sound byte! Noms..', this);
        this.addCommand('!whatsounds', [], this.list, 'What can you play....', this);
        this.addCommand('!!mute', ['time'], this.mute, 'Mute all sounds for a while', this);
        this.addCommand('!!unmute', [], this.unmute, 'Unmute all weebs again', this);
        this.addCommand('!ismute', [], this.isMute, 'Are we muted?', this);
    }

    /** @private */
    _loadConfiguration() {
        this._configuration = yaml.load(fs.readFileSync(this._soundConfigPath));
    }

    /** @private */
    _loadSounds() {
        for (const idx in this._configuration.sounds) {
            if (this._configuration.sounds.hasOwnProperty(idx)) {
                let sound = this._configuration.sounds[idx];
                this._addSound(sound.name, sound.response, sound.path, sound.config ?? {});
            }
        }
    }

    /**
     * @param {string} username
     * @param {string} soundName
     * @return {string|null|undefined}
     */
    play(username, soundName) {
        if (this._muted) {
            return;
        }
        const sound = this._sounds[soundName];
        if (!sound) {
            return `@${username}, I do not know how that sound goes....`
        }
        load(this._soundsPath + sound.path).then(play, sound.config ?? {});

        return sound.hasOwnProperty('response') ? `${sound.response}` : null;
    }

    /**
     * @param {string} username
     * @return {string}
     */
    list(username) {
        return `@${username}, available sounds are: ${Object.keys(this._sounds).join(", ")}`
    }

    /**
     * @param name
     * @param response
     * @param path
     * @param config
     * @private
     */
    _addSound(name, response, path, config) {
        this._sounds[name] = new Sound(name, response, path, config);
    }

    /**
     * @param {string} username
     * @param {int} time
     * @return {string}
     */
    mute(username, time) {
        if (time !== parseInt(time, 10)) {
            time = this._mute_duration;
        }
        let message;
        if (this._muted) {
            this._mutedEndTime = this._mutedEndTime + time;
            message = `${username} took even more breath away`;
        } else {
            this._mutedEndTime = Date.now() + time;
            this._setMuted(true);
            message = `${username} invoked SILENCE!`;
        }
        clearTimeout(this._muteTimeout);
        this._muteTimeout = setTimeout(this._setMuted.bind(this, false), this._mutedEndTime - Date.now());

        return message;
    }

    /**
     * @param {string} username
     * @return {string|null|undefined}
     */
    unmute(username) {
        if (!this._muted) {
            return;
        }
        console.log('  follwup ' + this._muted);
        this._setMuted(false);
        clearTimeout(this._muteTimeout);

        return `${username} gave y'all your voice back`;
    }

    /**
     * @param {string} username
     * @return {string}
     */
    isMute(username) {
        let response = `${username} we are ${this._muted ? '' : 'not '}muted.`;
        if (this._muted) {
            const seconds = (new Date(this._mutedEndTime).getTime() - Date.now()) / 1000;
            response += ` Still ${Math.round(seconds)} seconds to go`;
        }

        return response;
    }

    /**
     * @param {boolean} mute
     * @private
     */
    _setMuted(mute) {
        this._muted = mute;
    }
}

class Sound {
    name;
    response;
    path;
    config;

    /**
     * @param {string} name
     * @param {string} response
     * @param {string} path
     * @param {object} config
     */
    constructor(name, response, path, config) {
        this.name = name;
        this.response = response;
        this.path = path;
        this.config = config;
    }
}