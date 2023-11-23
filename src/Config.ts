class Config {
    static readonly token: string = "BOT_TOKEN";
    static readonly color: number = 0x00ffff;

    static readonly devData: { devsIds: string[], devGuildId: string } = {
        devsIds: [
            "FIRST_ID",
            "SECOND_ID"
        ],
        devGuildId: "THE_DEVELOPER'S_GUILD_ID" // Autista Team Residents
    };
}

export default Config;
