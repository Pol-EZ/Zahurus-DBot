import { ApplicationCommandOptionType, Guild, GuildMember } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "ban",
        description: "Bannea a un miembro del servidor.",
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: "member",
                description: "El usuario al que vas a bannear.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Number,
                name: "duration",
                description: "La duración del banneo (dejar en blanco para que sea permanente)."
            },
            {
                type: ApplicationCommandOptionType.String,
                name: "unit",
                description: "La unidad del tiempo (por defecto es \"Hours\").",
                choices: [
                    { name: "Días", value: "d" },
                    { name: "Horas", value: "h" },
                    { name: "Minutos", value: "m" },
                    { name: "Segundos", value: "s" },
                ]
            }
        ],
        defaultMemberPermissions: "BanMembers"
    },
    async run(client, interaction) {
        type TUnit = "d" | "h" | "m" | "s";

        const member: GuildMember = interaction.options.getMember("member") as GuildMember;
        const duration: number | undefined = interaction.options.getNumber("duration") || undefined;
        const unit: TUnit = interaction.options.getString("unit") as (TUnit | undefined) || "h";

        // Comprobaciones previas
        const userRoleIsLower: boolean = member.roles.highest > (interaction.member as GuildMember).roles.highest;
        const botRoleIsLower: boolean = member.roles.highest > ((interaction.guild as Guild).members.me as GuildMember).roles.highest;
        if (userRoleIsLower || botRoleIsLower) {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Usuario no banneable",
                        icon_url: client.utils.icons.cross
                    },
                    description: `El rol más alto de usuario al que intentas bannear es mayor que ${userRoleIsLower ? "tu" : "mi"} rol más alto`,
                    color: client.config.color
                }],
                ephemeral: true
            });

            return;
        }
        if (!member.bannable) return;
        
        await member.ban();
        
        let finalDuration: number = 0;
        let finalUnit: string = { d: "días", h: "horas", m: "minutos", s: "segundos" }[unit];
        if (duration) {
            finalDuration = duration * { d: 864e5, h: 36e5, m: 6e4, s: 1e3 }[unit || "h"];
            await client.utils.sleep(finalDuration);
            (interaction.guild as Guild).bans.remove(member.id).catch(() => {});
        }

        interaction.reply({
            embeds: [{
                author: {
                    name: "Usuario banneado",
                    icon_url: client.utils.icons.check
                },
                description: `${member.displayName} ha sido banneado ${duration ? `durante ${finalDuration} ${finalUnit}` : "permanentemente"}.`,
                color: client.config.color
            }],
            ephemeral: true
        });
    }
});