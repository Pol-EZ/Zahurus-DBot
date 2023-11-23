import { APIMessageComponentEmoji, ButtonStyle, ComponentType, GuildMember, Message } from "discord.js";
import { Queue, RepeatMode, Song } from "distube";

import Handler from "../Base/Handler.js";

interface TDistubeData {
    emojis: Record<string, APIMessageComponentEmoji>,
    message?: Message<true>,
    updateMessage(queue: Queue): Promise<void>
}

export default new Handler({
    async handle(client) {
        const distubeData: TDistubeData = {
            emojis: {
                previous: { id: "1170541522731667477" },
                backwards: { id: "1170541525155991563" },
                play: { id: "1170541535134232617" },
                pause: { id: "1170541530969280592" },
                forwards: { id: "1170541526477176832" },
                next: { id: "1170541520575791164" },
                loopQueue: { id: "1170541518004690994" },
                loopTrack: { id: "1170541516297601056" },
                volumeDown: { id: "1170541513093169242" },
                stop: { id: "1170541528926666793" },
                volumeUp: { id: "1170541514443726879" },
                random: { id: "1170541533498462248" }
            },
            async updateMessage(queue) {
                const song: Song = queue.songs[0];

                if (this.message) this.message.edit({
                    embeds: [{
                        author: {
                            name: "Estás escuchando..."
                        },
                        title: song.name?.replace(/\|\|/g, "\\|\\|").slice(0, 256),
                        url: song.url,
                        fields: [ // Campos de información de la canción
                            {
                                name: "Popularidad",
                                value: `**\`\`\`• Reproducciones: ${song.views.toLocaleString("es")} | • Likes: ${song.likes.toLocaleString("es")}\`\`\`**`
                            },
                            {
                                name: "Información",
                                value: `**\`\`\`• Duración: ${song.isLive ? "En vivo" : song.formattedDuration} | • Volumen: ${queue.volume}%\`\`\`**`
                            },
                            {
                                name: "Lista",
                                value: `**\`\`\`• Anterior: ${queue.previousSongs[0]?.name || "Nada"}\n• Siguiente: ${queue.songs[1]?.name || "Auto-play"}\`\`\`**`
                            }
                        ],
                        color: client.config.color
                    }],
                    components: [
                        { // Primera barra de botones
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    custom_id: "previous",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.previous
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "backwards",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.backwards
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "pause",
                                    style: ButtonStyle.Secondary,
                                    emoji: queue.paused ? distubeData.emojis.play : distubeData.emojis.pause
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "forwards",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.forwards
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "next",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.next
                                }
                            ]
                        },
                        { // Segunda barra de botones
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    custom_id: "loop",
                                    style: queue.repeatMode === RepeatMode.DISABLED ? ButtonStyle.Secondary : ButtonStyle.Success,
                                    emoji: queue.repeatMode === RepeatMode.SONG ? distubeData.emojis.loopTrack : distubeData.emojis.loopQueue
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "volumeDown",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.volumeDown
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "stop",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.stop
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "volumeUp",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.volumeUp
                                },
                                {
                                    type: ComponentType.Button,
                                    custom_id: "random",
                                    style: ButtonStyle.Secondary,
                                    emoji: distubeData.emojis.random
                                }
                            ]
                        }
                    ]
                });
            }
        }

        // Manejo de controles del reproductor
        client.on("interactionCreate", async (interaction) => {
            if (!interaction.isButton() || !interaction.guild) return;

            const queue: Queue | undefined = client.distube.getQueue(interaction.guild.id);
            const song: Song | undefined = queue?.songs[0];

            if (!queue || !song || (interaction.member as GuildMember).voice?.channel !== queue.voiceChannel) return;

            interaction.deferUpdate();

            const functions: { [key: string]: () => Promise<void> } = {
                "previous": async () => {
                    if (queue.currentTime < 5 && queue.previousSongs[0]) queue.previous();
                    else queue.seek(0);
                },
                "backwards": async () => {
                    queue.seek(queue.currentTime > 10 ? queue.currentTime - 10 : 0);
                },
                "pause": async () => {
                    if (queue.paused) queue.resume();
                    else queue.pause();
                },
                "forwards": async () => {
                    queue.seek(queue.currentTime < song.duration - 10 ? queue.currentTime + 10 : song.duration);
                },
                "next": async () => {
                    queue.skip();
                },
                "loop": async () => {
                    if (queue.repeatMode === RepeatMode.DISABLED) queue.setRepeatMode(RepeatMode.QUEUE);
                    else if (queue.repeatMode === RepeatMode.QUEUE) queue.setRepeatMode(RepeatMode.SONG);
                    else queue.setRepeatMode(RepeatMode.DISABLED);
                },
                "volumeDown": async () => {
                    queue.setVolume(queue.volume >= 10 ? queue.volume - 10 : 0);
                },
                "stop": async () => {
                    queue.stop();
                },
                "volumeUp": async () => {
                    queue.setVolume(queue.volume <= 90 ? queue.volume + 10 : 100);
                },
                "random": async () => {
                    queue.shuffle();
                }
            }

            await functions[interaction.customId]();
            await distubeData.updateMessage(queue);
        });

        // Al iniciar la lista:
        client.distube.on("initQueue", async (queue) => {
            if (!queue) return;

            queue.autoplay = true;
            queue.setVolume(50);

            distubeData.message = await queue.textChannel?.send({
                embeds: [{
                    author: {
                        name: "Iniciando reproductor...",
                        icon_url: client.utils.icons.loading
                    },
                    color: client.config.color
                }]
            }) as Message<true>;
            await client.utils.sleep(5000);
            distubeData.updateMessage(queue);
        });

        // Al añadir una canción a la lista:
        client.distube.on("addSong", async (queue) => await distubeData.updateMessage(queue));
        // Al reproducir una canción:
        client.distube.on("playSong", async (queue) => await distubeData.updateMessage(queue));

        // Manejo de diferentes formas de parar la lista para eliminar el mensaje
        async function deleteMessage(queue: Queue): Promise<void> {
            if (distubeData.message) await distubeData.message.delete();
            if (queue) queue.stop();
        }
        client.distube.on("finish", deleteMessage);
        client.distube.on("disconnect", deleteMessage);
        client.distube.on("empty", deleteMessage);
    },
});