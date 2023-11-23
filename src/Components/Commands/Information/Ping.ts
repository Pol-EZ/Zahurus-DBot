import Command from "../../../Structures/Base/Command.js";

export default new Command({
    data: {
        name: "ping",
        description: "Pong!"
    },
    async run(client, interaction) {
        let responseTime: number = Date.now();
        await interaction.reply({
            embeds: [{
                author: {
                    name: "Ping!",
                    icon_url: client.utils.icons.loading
                },
                description: `WebSocket: ${client.ws.ping}ms.\nBot: 0ms.`,
                color: client.config.color
            }],
            ephemeral: true
        });

        responseTime -= Date.now();
        interaction.editReply({
            embeds: [{
                author: {
                    name: "Pong!",
                    icon_url: client.utils.icons.check
                },
                description: `WebSocket: ${client.ws.ping}ms\nBot: ${Math.abs(responseTime)}ms`,
                color: client.config.color
            }]
        });
    }
})