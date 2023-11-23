import { ApplicationCommandOptionType, Guild, GuildMember, Role } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    data: {
        name: "mute",
        description: "Mutea a un miembro del servidor.",
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: "member",
                description: "El usuario que mutearás.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Number,
                name: "duration",
                description: "El tiempo que estará muteado el usuario seleccionado."
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
        ]
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

        const mutedRole: Role | undefined = interaction.guild?.roles.cache.find(role => role.name.toLowerCase() === "muted") || await interaction.guild?.roles.create({
            name: "Muted",
            color: 0x2b2d31,
            permissions: undefined
        });
        if (!mutedRole) return;

        member.roles.add(mutedRole);

        let finalDuration: number = 0;
        let finalUnit: string = { d: "días", h: "horas", m: "minutos", s: "segundos" }[unit || "h"];
        if (duration) {
            finalDuration = duration * { d: 864e5, h: 36e5, m: 6e4, s: 1e3 }[unit || "m"];
            await client.utils.sleep(finalDuration);
            member.roles.remove(mutedRole).catch(() => { });
        }

        await interaction.reply({
            embeds: [{
                author: {
                    name: "Usuario muteado",
                    icon_url: client.utils.icons.check
                },
                description: `${member.displayName} ha sido muteado ${duration ? `durante ${finalDuration} ${finalUnit}` : "permanentemente"}.`,
                color: client.config.color
            }],
            ephemeral: true
        });
    }
});