import { ProductSchema } from "./schema";
import { products } from "../data.js";
let toolGetProducts = {
    name: "get_products",
    inputSchema: ProductSchema,
    callback: async () => {
        return {
            content: products.map(product => ({
                type: "text",
                text: `ID: ${product.id}, name: ${product.name}, price: ${product.price}, description: ${product.description}`
            }))
        };
    }
};
export default toolGetProducts;