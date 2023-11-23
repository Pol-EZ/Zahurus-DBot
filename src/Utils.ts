import { APIEmbed, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, Interaction, InteractionCollector, InteractionResponse } from "discord.js";
import { existsSync, readdirSync, statSync } from "fs";
import { pathToFileURL } from "url";
import { resolve } from "path"
import Bot from "./Bot.js";

class Utils {
    private readonly client: Bot;

    constructor(client: Bot) {
        this.client = client;
    }

    public readonly icons = {
        check: "https://cdn.discordapp.com/emojis/1171241700451164161.webp?size=44&quality=lossless",
        cross: "https://cdn.discordapp.com/emojis/1171241702934204416.webp?size=44&quality=lossless",
        loading: "https://cdn.discordapp.com/emojis/1171245673845366804.gif?size=44&quality=lossless"
    }

    public async import(path: string): Promise<any> {
        return (await import(pathToFileURL(resolve(path)).toString()))?.default;
    }

    public async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async embedPages(interaction: Interaction, embeds: (EmbedBuilder | APIEmbed)[], ephemeral: boolean = false): Promise<void> {
        if (!interaction.isRepliable()) return;

        const firstPage = 0;
        const lastPage = embeds.length;
        let actualPage = 0;

        const iResponse: InteractionResponse = await interaction.reply({
            embeds: [embeds[actualPage]],
            components: [{
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        custom_id: "prevEmbed",
                        label: "◄",
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: ComponentType.Button,
                        custom_id: "nextEmbed",
                        label: "►",
                        style: ButtonStyle.Secondary
                    }
                ]
            }]
        });

        const collector: InteractionCollector<ButtonInteraction> = iResponse.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === interaction.user.id,
            time: 1000 * 60 * 3
        });

        collector.on("collect", async (i) => {
            if (!["prevEmbed", "nextEmbed"].includes(i.customId)) return;

            if (i.customId.startsWith("prev")) actualPage--;
            if (i.customId.startsWith("next")) actualPage++;

            if (actualPage < firstPage) actualPage = firstPage;
            if (actualPage > lastPage) actualPage = lastPage;

            await interaction.editReply({
                embeds: [embeds[actualPage]]
            });
        });
    }

    public async loadFilesFromFolder(componentFolder: string): Promise<string[] | undefined> {
        const loadedFilesPaths: string[] = [];

        try {
            const path: string = `./build/Components/${componentFolder}`;

            const isDirectory = existsSync(path) && statSync(path).isDirectory();
            if (!isDirectory) throw new Error(`El directorio ${path} no existe.`);

            const categories: string[] = readdirSync(path);
            for (const category of categories) {
                const categoryPath = `${path}/${category}`;

                if (!existsSync(categoryPath) && statSync(categoryPath).isDirectory()) {
                    console.warn(`El directorio ${categoryPath} no existe o no es un directorio.`);
                    continue;
                }

                const files: string[] = readdirSync(categoryPath);
                for (const file of files) {
                    loadedFilesPaths.push(`${categoryPath}/${file}`);
                }
            }

            return loadedFilesPaths;
        } catch (error: any) {
            console.error(`Error al cargar archivos: ${error}`);
            return undefined;
        }
    }
}

export default Utils;