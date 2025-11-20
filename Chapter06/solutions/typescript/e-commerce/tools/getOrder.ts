import { OrderInputSchema } from "./schema";
import { orders } from "../data.js";

let toolGetOrder = {
    name: "get_order",
    inputSchema: OrderInputSchema,
    callback: async ({ orderId }) => {
        const order = orders.find(order => order.id === orderId);

        if (!order) {
            throw new Error(`Order not found: ${orderId}`);
        }

        return {
            content: [{
                type: "text",
                text: `ID: ${order.id}, order.customerId: ${order.customerId}`
            }]
        };
    }
};
export default toolGetOrder;