import {Server} from "./src/Server.js";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const server = new Server(
    Server.defaultAdminConfigPath,
    Server.defaultApplicationConfigPath,
    Server.defaultClientConfigPath,
    Server.defaultAliasesConfigPath,
    Server.defaultUiConfigPath,
    Server.defaultBuiltInCommandsPath
);
server.start();
