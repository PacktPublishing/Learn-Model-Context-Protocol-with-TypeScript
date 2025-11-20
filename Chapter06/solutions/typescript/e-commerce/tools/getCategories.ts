/*
server.tool(
  "get_all_categories",
  {},
  async () => {
    return {
      content: categories.map(category => ({
        type: "text",
        text: `ID: ${category.name}, description: ${category.description}`
      }))
    };
  }
);
*/

import { categories } from "../data.js";
let toolGetCategories = {
    name: "get_categories",
    inputSchema: null,
    callback: async () => {
        return {
            content: categories.map(category => ({
                type: "text",
                text: `ID: ${category.id}, name: ${category.name}, description: ${category.description}`
            }))
        };
    }
};
export default toolGetCategories;