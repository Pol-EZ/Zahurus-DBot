import { Client, GatewayIntentBits, Partials } from "discord.js";
import { DisTube } from "distube";
import { QuickDB } from "quick.db";

import Config from "./Config.js";
import Utils from "./Utils.js";

import EventsHandler from "./Structures/Handlers/EventsHandler.js";
import CommandsHandler from "./Structures/Handlers/CommandsHandler.js";
import DistubeHandler from "./Structures/Handlers/DistubeHandler.js";
import ErrorsHandler from "./Structures/Handlers/ErrorsHandler.js";

class Bot extends Client {
    public readonly config = Config;
    public readonly utils: Utils = new Utils(this);
    public readonly database: QuickDB = new QuickDB();

    public readonly distube: DisTube = new DisTube(this);

    constructor() {
        super({
            intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
            partials: Object.values(Partials) as Partials[]
        });
    }

    public override async login(token: string): Promise<string> {
        ErrorsHandler.handle(this);
        EventsHandler.handle(this);

        const tkn: string = await super.login(token);

        CommandsHandler.handle(this),
        DistubeHandler.handle(this);

        return tkn;
    }
}

export default Bot