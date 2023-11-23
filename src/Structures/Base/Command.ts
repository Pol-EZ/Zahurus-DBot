import { ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";

import Bot from "../../Bot.js";

interface ICommandOptions {
    guildOnly?: boolean;
    devOnly?: boolean;
    data: ChatInputApplicationCommandData;
    run: (client: Bot, interaction: ChatInputCommandInteraction) => Promise<void>;
}

class Command {
    public readonly guildOnly?: boolean;
    public readonly devOnly?: boolean;
    public readonly data: ChatInputApplicationCommandData;
    public readonly run: (client: Bot, interaction: ChatInputCommandInteraction) => Promise<void>;

    constructor(options: ICommandOptions) {
        this.devOnly = options.devOnly;
        this.data = options.data;
        this.run = options.run;
    }
}

export default Command;