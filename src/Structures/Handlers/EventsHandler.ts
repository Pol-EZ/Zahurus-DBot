import { ClientEvents } from "discord.js";

import Handler from "../Base/Handler.js";
import Event from "../Base/Event.js";

export default new Handler({
    async handle(client) {
        const files: string[] | undefined = await client.utils.loadFilesFromFolder("Events");
        if (!files) return;
        for (const file of files) {
            const event: Event<keyof ClientEvents> = await client.utils.import(file);

            if (event.once) client.once(event.name, (...args) => event.run(client, ...args));
            else client.on(event.name, (...args) => event.run(client, ...args));
        }
    }
});