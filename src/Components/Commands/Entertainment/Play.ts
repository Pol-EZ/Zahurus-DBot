import { APISelectMenuOption, ApplicationCommandOptionType, ComponentType, DiscordjsError, GuildMember, GuildTextBasedChannel, InteractionResponse, VoiceBasedChannel } from "discord.js";
import { SearchResultVideo } from "distube";

import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "play",
        description: "Escucha música en un canal de voz con tus amigos.",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "track",
                description: "El nombre o URL (YouTube) de la canción deseada.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "search",
                description: "Si es verdadero (true) se mostrarán los resultados para que puedas seleccionar la pista que desees."
            }
        ]
    },
    async run(client, interaction) {
        const voiceChannel: VoiceBasedChannel | null = (interaction.member as GuildMember).voice?.channel;
        const track: string = interaction.options.getString("track", true);

        if (!voiceChannel) {
            interaction.reply({
                ephemeral: true,
                embeds: [{
                    author: {
                        name: "Fuera del canal de voz."
                    },
                    description: "Debes estar en un canal de voz para poder usar este comando.",
                    color: 0xff0000
                }]
            });

            return;
        }

        const searchResult: SearchResultVideo[] = (await client.distube.search(track, {
            safeSearch: false,
            limit: 20
        })).filter(async item => item !== undefined);

        const search: boolean | null = interaction.options.getBoolean("search");

        if (search === null || !search) { // Si el usuario elige no buscar...
            client.distube.play(voiceChannel, searchResult[0], {
                textChannel: interaction.channel as GuildTextBasedChannel
            });

            interaction.reply({
                embeds: [{
                    author: {
                        name: "Pista añadida",
                        icon_url: client.utils.icons.check
                    },
                    description: `La pista "${searchResult[0].name}" fue añadida a la cola de reproducción.`,
                    color: client.config.color
                }],
                ephemeral: true
            }).catch(() => { });
        } else { // Sino...
            const selectMenuOptions: APISelectMenuOption[] = [];

            for (let index = 0; index < searchResult.length; index++) {
                const result = searchResult[index];

                const alreadyExists = selectMenuOptions.some(option => option.value === result.name.toLowerCase());

                if (!alreadyExists) {
                    selectMenuOptions.push({
                        label: result.name,
                        value: result.name.toLowerCase(),
                        description: `Reproducciones: ${result.views.toLocaleString("es")} | Duración: ${result.isLive ? "En vivo" : result.formattedDuration}`
                    });
                }
            }

            const message: InteractionResponse<boolean> = await interaction.reply({
                embeds: [{
                    author: {
                        name: `Se han encontrado ${searchResult.length} resultados`,
                        icon_url: client.utils.icons.check
                    },
                    description: `Selecciona hasta 10 canciones para agregarlas a la cola de reproducción. Te quedan <t:${Math.floor((Date.now() + (3 * 60 * 1000)) / 1000)}:R>`,
                    color: client.config.color
                }],
                components: [{
                    type: ComponentType.ActionRow,
                    components: [{
                        type: ComponentType.StringSelect,
                        custom_id: "songSearch",
                        max_values: 10,
                        placeholder: "Selecciona hasta 10 opciones...",
                        options: selectMenuOptions
                    }]
                }]
            });

            message.awaitMessageComponent({
                componentType: ComponentType.StringSelect,
                time: 3 * 60 * 1000,
                filter: (i) => i.user.id === interaction.user.id
            }).then(async (i) => {
                if (!i.isStringSelectMenu() || !i.guild) return;

                const voiceChannel: VoiceBasedChannel | null = (i.member as GuildMember).voice.channel;
                const songList = i.values;

                if (!songList || !voiceChannel) return;

                await i.deferUpdate();

                for (const song of songList) {
                    await client.distube.play(voiceChannel, song, {
                        textChannel: interaction.channel as GuildTextBasedChannel
                    });
                }

                message.edit({
                    embeds: [{
                        author: {
                            name: `Se reproducirán los elementos seleccionados:`,
                            icon_url: client.utils.icons.check
                        },
                        description: i.values.map(value => "- " + value).join("\n"),
                        color: client.config.color
                    }],
                    components: [{
                        type: ComponentType.ActionRow,
                        components: [{
                            type: ComponentType.StringSelect,
                            custom_id: "songSearch",
                            max_values: 10,
                            placeholder: "Selecciona hasta 10 opciones...",
                            options: selectMenuOptions,
                            disabled: true
                        }]
                    }]
                });
            }).catch((e: DiscordjsError) => {
                if (e.cause === "time") return;

                console.log(e);
            });
        }
    }
});