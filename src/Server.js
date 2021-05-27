import {CommandList} from './Commands/CommandList.js';
import {Client} from "./Clients/Client.js";
import yaml from 'js-yaml';
import fs from 'fs';
import {UserInterface} from "./UI/UserInterface.js";
import {TextCommand} from "./Commands/TextCommand.js";

const BUILT_INS = {
    'Text' : TextCommand
};

export class Server {
    static _instance = null;
    static defaultAdminConfigPath = './resources/config/admins.yaml';
    static defaultApplicationConfigPath = './resources/config/applications.yaml'
    static defaultClientConfigPath = './resources/config/clients.yaml';
    static defaultAliasesConfigPath = './resources/config/aliases.yaml';
    static defaultUiConfigPath = './resources/config/ui.yaml';
    static defaultBuiltInCommandsPath = './resources/config/built-in-commands.yaml';
    _commandList = null;
    _admins = [];
    _applications = {};
    _adminConfigPath;
    _applicationConfigPath;
    _clientConfigPath;
    _aliasesConfigPath;
    _uiConfigPath;
    _builtInCommandsPath;
    _clients = [];
    _gui;

    /**
     *
     * @param {string} adminConfigPath
     * @param {string} applicationConfigPath
     * @param {string} clientConfigPath
     * @param {string} aliasesConfigPath
     * @param {string} uiConfigPath
     * @param {string} builtInCommandsPath
     */
    constructor(
        adminConfigPath,
        applicationConfigPath,
        clientConfigPath,
        aliasesConfigPath,
        uiConfigPath,
        builtInCommandsPath
    ) {
        this._adminConfigPath = adminConfigPath;
        this._applicationConfigPath = applicationConfigPath;
        this._clientConfigPath = clientConfigPath;
        this._aliasesConfigPath = aliasesConfigPath;
        this._uiConfigPath = uiConfigPath;
        this._builtInCommandsPath = builtInCommandsPath;

        this._commandList = CommandList.getInstance();
        this.loadAdmins();
        if (Server._instance === null) {
            Server.setInstance(this);
        }
    }

    /** @returns {Server} */
    static getInstance() {
        if (!Server._instance) {
            throw Error('Server not created');
        }
        return Server._instance;
    }

    /** @param {Server} server */
    static setInstance(server) {
        Server._instance = server;
    }

    /** @return {void} */
    async start() {
        await this._loadApplications();
        await this._loadBuiltIns();
        // await this._loadUI();
        this._commandList.importAliases(this._aliasesConfigPath);
        await this._loadClients();
    }

    /**
     * @param {string} username
     * @return {boolean}
     **/
    isAdmin(username) {
        return this._admins.includes(username.toLowerCase());
    }

    /**
     * @param {string} username
     * @return {int|null|undefined}
     **/
    addAdmin(username) {
        if (this.isAdmin(username)) {
            return;
        }
        return this._admins.push(username.toLowerCase());
    }

    /**
     * @return {CommandList}
     */
    getCommandsList() {
        return this._commandList;
    }



    /**
     * @return {void}
     * @async
     * @private
     * */
    async _loadApplications() {
        const {applications} = yaml.load(fs.readFileSync(this._applicationConfigPath));
        for (let idx in applications) {
            if (applications.hasOwnProperty(idx)) {
                const application = applications[idx];
                const applicationLoader = await import(application.path);
                if (application.hasOwnProperty('config')) {
                    this._applications[application.constructor] = new applicationLoader[application.constructor](application.config);
                } else {
                    this._applications[application.constructor] = new applicationLoader[application.constructor]();
                }
                console.log('loaded application: ' + application.constructor);
            }
        }
    }

    /**
     * @return {void}
     * @async
     * @private
     * */
    async _loadClients() {
        const {clients} = yaml.load(fs.readFileSync(this._clientConfigPath));
        for (let idx in clients) {
            if (clients.hasOwnProperty(idx)) {
                const client = clients[idx];
                const clientLoader = await import(client.path);
                if (client.hasOwnProperty('config')) {
                    this._clients[client.constructor] = new clientLoader[client.constructor](client.config);
                } else {
                    this._clients[client.constructor] = new clientLoader[client.constructor]();
                }
                this._clients[client.constructor].connect();
                console.log('loaded client: ' + client.constructor);
            }
        }
    }

    /**
     * @return {void}
     * @async
     * @private
     * */
    async _loadBuiltIns() {
        const {builtIns} = yaml.load(fs.readFileSync(this._builtInCommandsPath));
        for (let idx in builtIns) {
            if (builtIns.hasOwnProperty(idx)) {
                const builtIn = builtIns[idx];
                const builtInLoader = BUILT_INS[builtIn.type];
                builtInLoader.create(builtIn);
                console.log('loaded built-in: ' + builtIn.command);
            }
        }
    }

    /**
     * @return {void}
     * @async
     * @private
     * */
    async _loadUI() {
        const uiConfig = yaml.load(fs.readFileSync(this._uiConfigPath));
        this._gui = new UserInterface(uiConfig);
        this._gui.show();
    }

    /**
     * @return {void}
     * @private
     * */
    loadAdmins() {
        const {admins} = yaml.load(fs.readFileSync(this._adminConfigPath));
        for (let idx in admins) {
            if (admins.hasOwnProperty(idx)) {
                const admin = admins[idx];
                this.addAdmin(admin.name);
            }
        }
    }

    /**
     * @param {string} name
     * @return {null|Client}
     */
    getClient(name) {
        if (this._clients.hasOwnProperty(name)) {
            return this._clients[name];
        }
        return null;
    }

    /** @return {array<Client>} */
    getClients() {
        return this._clients;
    }

    /**
     * @param {string} name
     * @return {null|Application}
     */
    getApplication(name) {
        if (this._applications.hasOwnProperty(name)) {
            return this._applications[name];
        }
        return null;
    }
}