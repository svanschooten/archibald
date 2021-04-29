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

        this._setMuted(true);
        setTimeout(this._setMuted.bind(this, false), MUTE_DURATION);

        return `${username} invoked SILENCE!`;
    }

    isMute(username) {
        return `${username} we are ${this._muted ? '' : 'not '}muted`;
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