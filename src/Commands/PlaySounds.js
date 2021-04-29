import play from 'audio-play';
import load from 'audio-loader';
import yaml from 'js-yaml';
import fs from 'fs';
import { Server } from "../Server.js";
import { CommandList } from "./CommandList.js";

const SOUNDS_LOCATION = './resources/sounds/';
const MUTE_DURATION = 1000 * 60 * 2;

export class SoundLibrary {
    _sounds = {};
    _muted = false;
    _mutedEndTime = 0;
    _muteTimeout = null;

    constructor() {
        const config = yaml.load(fs.readFileSync('./resources/config/sounds.yaml'));
        for (const idx in config.sounds) {
            if (config.sounds.hasOwnProperty(idx)) {
                let sound = config.sounds[idx];
                this.addSound(sound.name, sound.response, sound.path, sound.config ?? {});
            }
        }

        const commandsList = CommandList.getInstance();
        commandsList.addCommand('!playsound', ['soundName'],  this.play, 'Plays a sound byte! Noms..', this);
        commandsList.addCommand('!whatsounds', [], this.list, 'What can you play....', this);
        commandsList.addCommand('!!mute', [], this.mute, 'Mute all sounds for a while', this);
        commandsList.addCommand('!!unmute', [], this.unmute, 'Unmute all weebs again', this);
        commandsList.addCommand('!ismute', [], this.isMute, 'Are we muted?', this);
    }

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

    list(username) {
        return `@${username}, available sounds are: ${Object.keys(this._sounds).join(", ")}`
    }

    addSound(name, response, path, config) {
        this._sounds[name] = new Sound(name, response, path, config);
    }

    mute(username) {
        if (!Server.getInstance().isAdmin(username)) {
            return `${username} Oh no you don't`;
        }
        let message;
        if (this._muted) {
            this._mutedEndTime = this._mutedEndTime + MUTE_DURATION;
            message = `${username} took even more breath away`;
        } else {
            this._mutedEndTime = Date.now() + MUTE_DURATION;
            this._setMuted(true);
            message = `${username} invoked SILENCE!`;
        }
        clearTimeout(this._muteTimeout);
        this._muteTimeout = setTimeout(this._setMuted.bind(this, false), this._mutedEndTime - Date.now());

        return message;
    }

    unmute(username) {
        if (!Server.getInstance().isAdmin(username)) {
            return `${username} Oh no you don't`;
        }
        if (!this._muted) {
            return;
        }
        this._setMuted(false);
        clearTimeout(this._muteTimeout);

        return `${username} gave y'all your voice back`;
    }

    isMute(username) {
        let response = `${username} we are ${this._muted ? '' : 'not '}muted.`;
        if (this._muted) {
            const seconds = (new Date(this._mutedEndTime).getTime() - Date.now()) / 1000;
            response += ` Still ${Math.round(seconds)} seconds to go`;
        }

        return response;
    }

    _setMuted(mute) {
        this._muted = mute;
    }
}

export class Sound {
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