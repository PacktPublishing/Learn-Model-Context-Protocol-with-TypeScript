import { Tool } from "./tool.js";
import { MathInputSchema } from "./schema.js";

export default {
    name: "subtract",
    inputSchema: MathInputSchema,
    callback: async ({ a, b }) => {
        return {
            content: [{ type: "text", text: String(a - b) }]
        };
    }
} as Tool;