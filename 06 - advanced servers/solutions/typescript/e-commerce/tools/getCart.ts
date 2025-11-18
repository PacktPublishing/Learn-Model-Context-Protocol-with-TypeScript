import { CartsInputSchema } from "./schema";
import { customers, carts } from "../data.js";

let toolGetCart = {
    name: "get_cart",
    inputSchema: CartsInputSchema,
    callback: async ({ customerId }) => {
        if (customerId !== "" && !customers.some(customer => customer.id === customerId)) {
            throw new Error(`Invalid customer_id: ${customerId}`);
        }

        const cart = carts.find(cart => cart.customerId === customerId);
        if (cart) {
            return {
                content: [{
                    type: "text",
                    text: `ID: ${cart.id}, customer: ${cart.customerId}`
                }]
            };
        } else {
            return {
                content: [{
                    type: "text",
                    text: `No cart found for customer ID: ${customerId}`
                }]
            };
        }
    }
};

export default toolGetCart;