import { EchoInputSchema } from "./schema";

let tool = {
    name: "echo",
    inputSchema: EchoInputSchema,
    callback: async ({ message }) => {
        return {
            content: [{ type: "text", text: message }]
        };
    }
};

export default tool;