import { ChatInputApplicationCommandData } from "discord.js";

import Handler from "../Base/Handler.js";
import Command from "../Base/Command.js";

export default new Handler({
    async handle(client) {
        // Unregistering old commands
        if (client.application) for (const command of client.application.commands.cache) {
            await command[1].delete();
        }

        for (const guild of client.guilds.cache) {
            for (const command of guild[1].commands.cache) {
                await command[1].delete();
            }
        }

        // Registering new commands
        const commands: Map<string, Command> = new Map<string, Command>();

        const devCommandsData: ChatInputApplicationCommandData[] = [];
        const commandsData: ChatInputApplicationCommandData[] = [];

        const files: string[] | undefined = await client.utils.loadFilesFromFolder("Commands");
        if (!files) return;
        for (const file of files) {
            const command: Command = await client.utils.import(file);

            if (command.devOnly) devCommandsData.push(command.data);
            else commandsData.push(command.data);

            commands.set(command.data.name, command);
        }

        client.guilds.cache.get(client.config.devData.devGuildId)?.commands.set(devCommandsData);
        client.application?.commands.set(commandsData);

        // Handling command interactions
        client.on("interactionCreate", (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            if (!interaction.guild?.members.me?.permissions.has("Administrator")) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Mala configuración",
                            icon_url: client.utils.icons.cross
                        },
                        description: 
                            "Para poder usar cualquier comando debo tener permisos de administrador." + 
                            "Esto es una manera rápida y sencilla de eliminar una gestión de permisos que haría que mi desarrollador pierda tiempo valioso.\n" +
                            "Mis funcionalidades son totalmente seguras, recuerda siempre darle permisos solo a usuarios de confianza para evitar mi mal uso.",
                        color: client.config.color
                    }],
                    ephemeral: true
                });
                return;
            }

            const command: Command | undefined = commands.get(interaction.commandName);
            if (!command) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Comando no existente",
                            icon_url: client.utils.icons.cross
                        },
                        description: "El comando que intentas utilizar no existe o fue eliminado.",
                        color: client.config.color
                    }],
                    ephemeral: true
                });

                return;
            }

            if (command.guildOnly && !interaction.guild) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Solo para servidores",
                            icon_url: client.utils.icons.cross
                        },
                        description: "Este comando es exclusivo para uso en servidores.",
                        color: client.config.color
                    }],
                    ephemeral: true
                });

                return;
            }

            if (command.devOnly && !client.config.devData.devsIds.includes(interaction.user.id)) {
                interaction.reply({
                    embeds: [{
                        author: {
                            name: "Solo para desarrolladores."
                        },
                        description: "El comando que intentas utilizar es exclusivo para los desarrolladores del bot.",
                        color: 0xff0000
                    }],
                    ephemeral: true
                });

                return;
            }

            command.run(client, interaction);
        });
    }
});