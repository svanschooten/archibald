import {QMainWindow,QLabel} from "./UIElement.js";
import {Image} from './Image.js';

export class UserInterface {
    _mainWindow;

    /** @param {object} config */
    constructor(config) {
        let name = 'MainUserInterface',
            width = 1280,
            height = 720,
            colorKey = '#00ff00',
            hidden = false;
        if (config.hasOwnProperty('name')) name = config['name'];
        if (config.hasOwnProperty('width')) width = config['width'];
        if (config.hasOwnProperty('height')) height = config['height'];
        if (config.hasOwnProperty('colorKey')) colorKey = config['colorKey'];
        if (config.hasOwnProperty('hidden')) hidden = String(config['hidden']).toLowerCase() === "true";

        this._mainWindow = new QMainWindow();
        this._mainWindow.setWindowTitle(name);
        this._mainWindow.setInlineStyle(`background:${colorKey}`);
        if (hidden) this._mainWindow.setWindowOpacity(0);
        this._mainWindow.resize(width, height);

        new Image(this._mainWindow, './resources/images/dancing-banana.gif', true);
    }

    show() {
        this._mainWindow.show();
    }
}