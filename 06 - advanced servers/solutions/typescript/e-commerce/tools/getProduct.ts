/*
// Get product by ID
server.tool(
  "get_product",
  {
    product_id: z.string()
  },
  async ({ product_id }) => {
    const product = products.find(product => product.name === product_id);
    if (product) {
      return {
        content: [{
          type: "text",
          text: `ID: ${product.name}, price: ${product.price}, description: ${product.description}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `Product not found with ID: ${product_id}`
        }]
      };
    }
  }
);
*/

import { ProductInputSchema } from "./schema";
import { products } from "../data.js";
let toolGetProduct = {
    name: "get_product",
    inputSchema: ProductInputSchema,
    callback: async ({ productId }) => {
        const product = products.find(product => product.id === productId);
        if (product) {
            return {
                content: [{
                    type: "text",
                    text: `ID: ${product.id}, name: ${product.name}, price: ${product.price}, description: ${product.description}`
                }]
            };
        } else {
            return {
                content: [{
                    type: "text",
                    text: `Product not found with ID: ${productId}`
                }]
            };
        }
    }
};
export default toolGetProduct;