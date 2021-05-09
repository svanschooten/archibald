import play from 'audio-play';
import load from 'audio-loader';
import yaml from 'js-yaml';
import fs from 'fs';
import { Application } from "./Application.js";

const SOUNDS_LOCATION = './resources/sounds/';
const MUTE_DURATION = 1000 * 60 * 2;

export class SoundPlayer extends Application {
    _sounds = {};
    _muted = false;
    _mutedEndTime = 0;
    _muteTimeout = null;
    static name = 'sound-library';

    constructor() {
        super();
        const config = yaml.load(fs.readFileSync('./resources/config/sounds.yaml'));
        for (const idx in config.sounds) {
            if (config.sounds.hasOwnProperty(idx)) {
                let sound = config.sounds[idx];
                this._addSound(sound.name, sound.response, sound.path, sound.config ?? {});
            }
        }

        this.addCommand('!playsound', ['soundName'],  this.play, 'Plays a sound byte! Noms..', this);
        this.addCommand('!whatsounds', [], this.list, 'What can you play....', this);
        this.addCommand('!!mute', ['time'], this.mute, 'Mute all sounds for a while', this);
        this.addCommand('!!unmute', [], this.unmute, 'Unmute all weebs again', this);
        this.addCommand('!ismute', [], this.isMute, 'Are we muted?', this);
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
        load(SOUNDS_LOCATION + sound.path).then(play, sound.config ?? {});

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
            time = MUTE_DURATION;
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

    constructor(name, response, path, config) {
        this.name = name;
        this.response = response;
        this.path = path;
        this.config = config;
    }
}