import Handler from "../Base/Handler.js";

export default new Handler({
    async handle(client) {
        async function handleError(error: Error): Promise<void> {
            console.log(error);
        }

        client.on("error", handleError);
        process.on("uncaughtException", handleError);
        process.on("uncaughtExceptionMonitor", handleError);
        process.on("unhandledRejection", handleError);
    }
});