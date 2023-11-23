import { ApplicationCommandOptionType, EmbedBuilder, GuildMember } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    data: {
        name: "user",
        description: "Muestra el avatar del usuario elegido.",
        options: [{
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "El usuario del avatar que quieres ver."
        }]
    },
    async run(client, interaction) {
        const member: GuildMember = (interaction.options.getMember("member") || interaction.member) as GuildMember;

        const embed: EmbedBuilder = new EmbedBuilder({
            fields: [
                { name: "Nombre de usuario", value: member.user.username, inline: true },
                { name: "Nombre mostrado", value: member.user.displayName || "Ninguno", inline: true },
                { name: "ID", value: member.id, inline: false },
                { name: "Fecha de creación", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
            ]
        }).setImage(member.user.bannerURL() || null).setThumbnail(member.user.displayAvatarURL());

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
});