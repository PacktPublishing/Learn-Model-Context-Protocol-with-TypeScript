/*
// Get all customers
server.tool(
  "get_all_customers",
  {},
  async () => {
    return {
      content: customers.map(customer => ({
        type: "text",
        text: `ID: ${customer.id}, name: ${customer.name}, email: ${customer.email}`
      }))
    };
  });
*/

import { customers } from "../data.js";

let toolGetCustomers = {
    name: "get_customers",
    inputSchema: null,
    callback: async () => {
        return {
            content: customers.map(customer => ({
                type: "text",
                text: `ID: ${customer.id}, name: ${customer.name}, email: ${customer.email}`
            }))
        };
    }
};
export default toolGetCustomers;