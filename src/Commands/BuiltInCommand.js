export class BuiltInCommand{
    static TYPE = 'Abstract';

    /**
     * @param {object} config
     */
    static create(config) {
        throw Error('Abstract command cannot be called!');
    }
}