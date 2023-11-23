import { ApplicationCommandOptionType, Guild, GuildMember, Role } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "unmute",
        description: "Desmutea a un miembro del servidor.",
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: "member",
                description: "El usuario al que deseas desmutear.",
                required: true
            }
        ]
    },
    async run(client, interaction) {
        const member: GuildMember = interaction.options.getMember("member") as GuildMember;

        // Comprobaciones previas
        const userRoleIsLower: boolean = member.roles.highest > (interaction.member as GuildMember).roles.highest;
        const botRoleIsLower: boolean = member.roles.highest > ((interaction.guild as Guild).members.me as GuildMember).roles.highest;
        if (userRoleIsLower || botRoleIsLower) {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Usuario no muteable",
                        icon_url: client.utils.icons.cross
                    },
                    description: `El rol más alto de usuario al que intentas mutear es mayor que ${userRoleIsLower ? "tu" : "mi"} rol más alto`,
                    color: client.config.color
                }],
                ephemeral: true
            });

            return;
        }

        const mutedRole: Role | undefined = interaction.guild?.roles.cache.find(role => role.name.toLowerCase() === "muted");
        if (!mutedRole) {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "El usuario no está muteado o su rol de muteo no se llama \"Muted\"",
                        icon_url: client.utils.icons.cross
                    },
                    description: "La deteccion del rol de muteo funciona por nombre, por lo tanto si no se encuentra un rol con ese nombre se considera que el usuario no está muteado.",
                    color: client.config.color
                }],
                ephemeral: true
            });

            return;
        }

        member.roles.remove(mutedRole);

        interaction.reply({
            embeds: [{
                author: {
                    name: "El usuario a sido desmuteado",
                    icon_url: client.utils.icons.check
                },
                description: `${member.displayName} ha sido desmuteado correctamente.`,
                color: client.config.color
            }],
            ephemeral: true
        });
    },
});