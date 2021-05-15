import {Storage} from "./Storage.js";
import {existsSync, readFileSync, writeFileSync} from 'fs';

export class FileStorage extends Storage {
    static TYPE = 'FileStorage';
    _location;

    /**
     * @param {object} config
     */
    constructor(config) {
        super();
        this._location = config.location;
    }

    /** @return string|boolean */
    load() {
        if (existsSync(this._location)) {
            return readFileSync(this._location).toString();
        }
        return false;
    }

    /** @param {string} content */
    store(content) {
        writeFileSync(this._location, content);
    }
}