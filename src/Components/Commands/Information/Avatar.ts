import { ApplicationCommandOptionType, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, InteractionCollector, InteractionResponse } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    data: {
        name: "avatar",
        description: "Muestra el/los avatar(es) del usuario seleccionado.",
        options: [{
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "El usuario del avatar que quieres ver."
        }]
    },
    async run(client, interaction) {
        const member: GuildMember = (interaction.options.getMember("member") || interaction.member) as GuildMember;

        let actualEmbed: number = 0;
        const embeds: EmbedBuilder[] = [
            new EmbedBuilder({
                author: {
                    name: member.user.displayName,
                    icon_url: client.utils.icons.check
                },
                color: client.config.color
            }).setImage(member.user.displayAvatarURL({ size: 512 })),
            new EmbedBuilder({
                author: {
                    name: member.displayName,
                    icon_url: client.utils.icons.check
                },
                color: client.config.color
            }).setImage(member.displayAvatarURL({ size: 512 }))
        ];

        const iReply: InteractionResponse = await interaction.reply({
            embeds: [embeds[actualEmbed]],
            components: [{
                type: ComponentType.ActionRow,
                components: [
                    {
                        type: ComponentType.Button,
                        custom_id: "prevAvatar",
                        label: "◄",
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: ComponentType.Button,
                        custom_id: "nextAvatar",
                        label: "►",
                        style: ButtonStyle.Secondary
                    }
                ]
            }],
            ephemeral: true
        });

        const collector: InteractionCollector<ButtonInteraction> = iReply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === interaction.user.id,
            time: 1000 * 60 * 3
        });

        collector.on("collect", async (i) => {
            if (!["prevAvatar", "nextAvatar"].includes(i.customId)) return;

            collector.resetTimer();
            i.deferUpdate();

            if (i.customId.startsWith("next")) actualEmbed++;
            else actualEmbed--;

            if (actualEmbed > 1) actualEmbed = 1;
            if (actualEmbed < 0) actualEmbed = 0;

            interaction.editReply({
                embeds: [embeds[actualEmbed]]
            });
        })

        collector.on("end", async (collected, reason) => {
            if (iReply) await iReply.delete();
        });
    }
});