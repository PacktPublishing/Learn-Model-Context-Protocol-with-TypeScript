import { z, ZodObject } from "zod";

// take a type
export const MathInputSchema = z.object({ a: z.number(), b: z.number() });
// conversion function,
function zodToJsonSchema(zodSchema: ZodObject<any>): any {
    // Use _def.shape() to get the shape in recent Zod versions
    const shape = typeof zodSchema.shape === "function"
        ? zodSchema.shape()
        : (zodSchema._def && typeof zodSchema._def.shape === "function"
            ? zodSchema._def.shape()
            : zodSchema.shape);

    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const key in shape) {
        const def = shape[key];

        // Handle ZodString
        if (def instanceof z.ZodString) {
            properties[key] = { type: "string" };
        }
        // Handle ZodNumber
        else if (def instanceof z.ZodNumber) {
            properties[key] = { type: "number" };
        }
        // Handle ZodBoolean
        else if (def instanceof z.ZodBoolean) {
            properties[key] = { type: "boolean" };
        }
        // Handle nested ZodObject
        else if (def instanceof z.ZodObject) {
            properties[key] = zodToJsonSchema(def);
        }
        // Handle ZodArray
        else if (def instanceof z.ZodArray) {
            properties[key] = {
                type: "array",
                items: zodToJsonSchema(def._def.type)
            };
        }
        // Fallback
        else {
            properties[key] = { type: "string" };
        }

        // Check if field is required
        if (!def.isOptional()) {
            required.push(key);
        }
    }

    return {
        type: "object",
        properties,
        required,
    };
}

let result = zodToJsonSchema(MathInputSchema);
console.log(result);

// ensure we get a well formed inputSchema