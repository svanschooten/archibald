export class Client {
    async connect() {
        throw Error('Abstract client cannot connect');
    }
}