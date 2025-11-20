import { MathInputSchema } from "./schema";

let tool = {
    name: "add",
    inputSchema: MathInputSchema,
    callback: async ({ a, b }) => {
        return {
            content: [{ type: "text", text: String(a + b) }]
        };
    }
};
export default tool;
