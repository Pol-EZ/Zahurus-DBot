import { ApplicationCommandOptionType, Guild, GuildInvitableChannelResolvable, Invite, User } from "discord.js";
import Command from "../../../Structures/Base/Command.js";

export default new Command({
    guildOnly: true,
    data: {
        name: "unban",
        description: "Desbannea a un usuario.",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "username",
                description: "El nombre de usuario único o ID del usuario a desbannear.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "sendinvite",
                description: "Si es 'True' se intentará enviar una invitación al usuario desbanneado."
            }
        ]
    },
    async run(client, interaction) {
        const username: string = interaction.options.getString("username", true);
        const sendinvite: boolean = interaction.options.getBoolean("sendinvite") || false;

        const user: User | undefined = client.users.cache.find(user => user.username.toLowerCase() === username.toLowerCase()) || client.users.cache.get(username);
        if (!user) {
            interaction.reply({
                embeds: [{
                    author: {
                        name: "Usuario no encontrado.",
                        icon_url: client.utils.icons.cross
                    },
                    description: "La información proporcionada en el parámetro \"username\" no es correcta. Recuerda proporcionar solo el nombre de usuario (Username) y no el nombre mostrado (DisplayName) o en cambio proporcionar la ID del usuario directamente.",
                    color: client.config.color
                }],
                ephemeral: true
            });

            return;
        }

        await (interaction.guild as Guild).members.unban(user.id);
        let inviteSent: boolean = false;
        if (sendinvite) inviteSent = await createAndSendInvite();

        interaction.reply({
            embeds: [{
                author: {
                    name: "Usuario desbanneado",
                    icon_url: client.utils.icons.check
                },
                description: `${user.displayName} ha sido desbanneado completamente y ya puede volver a unirse. ${inviteSent ? "La invitación fue enviada." : ""}`,
                color: client.config.color
            }],
            ephemeral: true
        });

        async function createAndSendInvite(): Promise<boolean> {
            const inviteChannel: GuildInvitableChannelResolvable = interaction.guild?.channels.cache.first() as GuildInvitableChannelResolvable;
            if (!inviteChannel) return false;
        
            const invite: Invite | undefined = await interaction.guild?.invites.create(inviteChannel, {
                temporary: false,
                maxUses: 1
            });
            if (!invite) return false;
        
            user?.send(invite.url);
            return true;
        }
    }
});