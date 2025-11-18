import { PlaceOrderInputSchema } from "./schema";
import { customers, orders } from "../data.js";

let toolPlaceOrder = {
    name: "place_order",
    inputSchema: PlaceOrderInputSchema,
    callback: async ({ customerId }) => {
        if (customerId !== "" && !customers.some(customer => customer.id === customerId)) {
            throw new Error(`Invalid customer_id: ${customerId}`);
        }

        const newOrder = {
            id: String(orders.length + 1), // Simple ID generation
            customerId
        };
        orders.push(newOrder);

        return {
            content: [{
                type: "text",
                text: `ID: ${newOrder.id}, customer: ${customerId}`
            }]
        };
    }
};
export default toolPlaceOrder;