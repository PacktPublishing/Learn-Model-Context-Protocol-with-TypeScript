import { OrdersInputSchema } from "./schema";
import { customers, orders } from "../data.js";

let toolGetOrders = {
    name: "get_orders",
    inputSchema: OrdersInputSchema,
    callback: async ({ customerId }) => {

        if (customerId !== "" && !customers.some(customer => customer.id === customerId)) {
            throw new Error(`Invalid customer_id: ${customerId}`);
        }

        const filteredOrders = customerId !== ""
            ? orders.filter(order => order.customerId === customerId)
            : orders;

        const mapped = filteredOrders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return {
                type: "text",
                text: `ID: ${order.id}, customer: ${customer ? customer.name : "Unknown"}`
            };
        });

        return {
            content: mapped
        };
    }
};
export default toolGetOrders;