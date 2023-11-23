import { Guild } from "discord.js";
import { Queue } from "distube";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "queue",
        description: "Muestra la lista de reproduccion actual."
    },
    async run(client, interaction) {
        const queue: Queue | undefined = client.distube.getQueue((interaction.guild as Guild).id);
        if (!queue) {
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    author: {
                        name: "No hay lista de reproducción",
                        icon_url: client.utils.icons.cross
                    },
                    description: "Para usar este comando se debe estar reproduciendo música en algún canal de voz del mismo servidor.",
                    color: client.config.color
                }]
            });

            return;
        };

        interaction.reply({
            ephemeral: true,
            embeds: [{
                author: {
                    name: "Lista de reproducción",
                    icon_url: client.utils.icons.check
                },
                description: queue.songs.map(song => "- " + song.name).join("\n"),
                color: client.config.color
            }]
        });
    }
});