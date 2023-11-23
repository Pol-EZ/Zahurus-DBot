import { ActivityType } from "discord.js"

import Event from "../../../Structures/Base/Event.js";

export default new Event({
    once: true,
    name: "ready",
    async run(client) {
        client.user?.setPresence({
            status: "idle",
            activities: [{
                name: "todos tus movimientos",
                type: ActivityType.Watching
            }]
        });

        console.log("Bot listo!");
    },
});