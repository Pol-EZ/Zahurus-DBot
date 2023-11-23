import { ClientEvents } from "discord.js";

import Bot from "../../Bot.js";

interface IEventOptions<Key extends keyof ClientEvents> {
    once?: boolean;
    name: Key;
    run: (client: Bot, ...args: ClientEvents[Key]) => Promise<void>;
}

class Event<Key extends keyof ClientEvents> {
    public readonly once?: boolean;
    public readonly name: Key;
    public readonly run: (client: Bot, ...args: ClientEvents[Key]) => Promise<void>;

    constructor(options: IEventOptions<Key>) {
        this.once = options.once;
        this.name = options.name;
        this.run = options.run;
    }
}

export default Event;