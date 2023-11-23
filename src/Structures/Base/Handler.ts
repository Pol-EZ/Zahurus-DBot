import Bot from "../../Bot.js";

interface IHandlerOptions {
    handle(client: Bot): Promise<void>;
}

class Handler {
    public readonly handle: (client: Bot) => Promise<void>;
    
    constructor (options: IHandlerOptions) {
        this.handle = options.handle;
    }
}

export default Handler;