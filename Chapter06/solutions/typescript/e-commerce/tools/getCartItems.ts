import { CartItemsInputSchema } from "./schema";
import { cartItems } from "../data.js";

let toolGetCartItems = {
    name: "get_cart_items",
    inputSchema: CartItemsInputSchema,
    callback: async ({ cartId, cartItemId }) => {
        const items = cartItems.filter(item => item.cartId === cartId && item.id === cartItemId);
        if (items.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No items found for cart ID: ${cartId} and item ID: ${cartItemId}`
                }]
            };
        }
        return {
            content: items.map(item => ({
                type: "text",
                text: `ID: ${item.cartId}, product: ${item.productId}, quantity: ${item.quantity}`
            }))
        };
    }
};
export default toolGetCartItems;