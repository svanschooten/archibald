import {Storage} from './Storage.js';
import {FileStorage} from "./FileStorage.js";

export class StorageFactory {
    /**
     * @param {string} type
     * @param {object} config
     * @return {Storage}
     */
    static create(type, config) {
        switch (type) {
            case FileStorage.TYPE:
                return new FileStorage(config);
            default:
                throw Error('undefined storage type: ' + type);
        }
    }
}