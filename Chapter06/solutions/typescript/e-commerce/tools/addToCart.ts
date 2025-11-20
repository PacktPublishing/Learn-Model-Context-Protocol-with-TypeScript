/*
// Add to cart
server.tool(
  "add_to_cart",
  {
    cart_id: z.string(),
    product_id: z.number(),
    quantity: z.number()
  },
  async ({ cart_id, product_id, quantity }) => {
    const newCartItem = new CartItem(cart_id, product_id, quantity);
    cartItems.push(newCartItem);
    return {
      content: [{
        type: "text",
        text: `ID: ${newCartItem.cartId}, product: ${newCartItem.productId}, quantity: ${newCartItem.quantity}`
      }]
    };
  }
);

*/

import { CartItemInputSchema } from "./schema";
import { cartItems } from "../data.js";

let toolAddToCart = {
    name: "add_to_cart",
    inputSchema: CartItemInputSchema,
    callback: async ({ cartId, productId, quantity }) => {
        const newCartItem = {
            id: (cartItems.length + 1).toString(), // Simple ID generation
            cartId,
            productId,
            quantity
        };
        cartItems.push(newCartItem);

        return {
            content: [{
                type: "text",
                text: `Added to cart - ID: ${newCartItem.id}, product: ${newCartItem.productId}, quantity: ${newCartItem.quantity}`
            }]
        };
    }
};
export default toolAddToCart;