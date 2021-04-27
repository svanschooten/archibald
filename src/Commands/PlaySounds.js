import play from 'audio-play';
import load from 'audio-loader';
import yaml from 'js-yaml';
import fs from 'fs';

const SOUNDS_LOCATION = './resources/sounds/';

export class SoundLibrary {
    _sounds;

    constructor(commandsList) {
        this._sounds = {};
        const config = yaml.load(fs.readFileSync('./resources/config/sounds.yaml'));
        for (const idx in config.sounds) {
            // noinspection JSUnfilteredForInLoop
            let sound = config.sounds[idx];
            this.addSound(sound.name, sound.response, sound.path, sound.config ?? {});
        }

        commandsList.addCommand(
            '!playsound',
            ['soundName'],
            this.play,
            'Plays a sound byte! Noms..',
            this
        );
        commandsList.addCommand(
            '!whatsounds',
            [],
            this.list,
            'What can you play....',
            this
        );
    }

    play(username, soundName) {
        const sound = this._sounds[soundName];
        if (!sound) {
            return `@${username}, I do not know how that sound goes....`
        }
        load(SOUNDS_LOCATION + sound.path).then(play, sound.config ?? {});

        return `${sound.response}`;
    }

    list(username) {
        return `@${username}, available sounds are: ${Object.keys(this._sounds).join(", ")}`
    }

    addSound(name, response, path, config) {
        this._sounds[name] = new Sound(name, response, path, config);
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