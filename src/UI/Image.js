import {QLabel,QPixmap,NodeWidget,QMovie} from "./UIElement.js";
import fs from 'fs';

export class Image extends QLabel {
    _path;

    /**
     * @param {NodeWidget} parent
     * @param {string} path
     * @param {boolean} isAnimated
     */
    constructor(parent, path, isAnimated = false) {
        super(parent);
        this._path = path;
        if (isAnimated) {
            const movie = new QMovie();
            movie.loadFromData(fs.readFileSync(this._path));
            movie.start();
            this.setMovie(movie);
        } else {
            const image = new QPixmap();
            image.loadFromData(this._path);
            this.setPixmap(image);
        }
        this.adjustSize();
    }
}