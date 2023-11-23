import { ApplicationCommandOptionType, Guild, GuildMember } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "kick",
        description: "Kickea a un usuario del servidor.",
        defaultMemberPermissions: "KickMembers",
        options: [{
            type: ApplicationCommandOptionType.User,
            name: "member",
            description: "El usuario al que deseas kickear.",
            required: true
        }]
    },
    async run(client, interaction) {
        const member: GuildMember = interaction.options.getMember("member") as GuildMember;

        const userRoleIsLower: boolean = member.roles.highest >= (interaction.member as GuildMember).roles.highest;
        const botRoleIsLower: boolean = member.roles.highest >= ((interaction.guild as Guild).members.me as GuildMember).roles.highest;
        if (userRoleIsLower || botRoleIsLower) {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Usuario no banneable",
                        icon_url: client.utils.icons.cross
                    },
                    description: `El rol más alto de usuario al que intentas bannear es mayor o igual que ${userRoleIsLower ? "tu" : "mi"} rol más alto`,
                    color: client.config.color
                }],
                ephemeral: true
            });

            return;
        }
        if (!member.kickable) return;

        await member.kick();

        interaction.reply({
            embeds: [{
                author: {
                    name: "Usuario kickeado",
                    icon_url: client.utils.icons.check
                },
                description: `Se ha kickeado al usuario correctamente.`,
                color: client.config.color
            }],
            ephemeral: true
        });
    }
});