import { ApplicationCommandOptionType, Guild, Message } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "say",
        description: "Haz que el bot diga algo. Tanto un mensaje simple como una respuesta.",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "content",
                description: "Lo que quieres que diga.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.String,
                name: "response_message_id",
                description: "ID del mensaje al que deseas que le responda. Dejar en blanco si no quieres que le responda a nadie."
            }
        ]
    },
    async run(client, interaction) {
        const content: string = interaction.options.getString("content", true);
        const messageId: string | undefined = interaction.options.getString("response_message_id", false) || undefined;

        if (messageId) {
            const message: Message | undefined = interaction.channel?.messages.cache.get(messageId);
            if (!message) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Respuesta no enviada.",
                            icon_url: client.utils.icons.cross
                        },
                        description: "El mensaje no ha sido enviado porque la ID proporcionada es erronea o el mensaje ya no existe.",
                        color: client.config.color
                    }],
                    ephemeral: true
                });

                return;
            };

            message.reply({ content });
        } else interaction.channel?.send({ content });

        interaction.reply({
            embeds: [{
                author: {
                    name: "Mensaje enviado",
                    icon_url: client.utils.icons.check
                },
                description: "El mensaje ha sido enviado con éxito.",
                color: client.config.color
            }],
            ephemeral: true
        });
    }
});