// index.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

class Customer {
  id: number;
  name: string;
  email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Category {
  id: string;
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
  }
}

class Product {
  name: string;
  price: number;
  description: string;

  constructor(name: string, price: number, description: string) {
    this.name = name;
    this.price = price;
    this.description = description;
  }
}

class CartItem {
  cartId: string;
  productId: number;
  quantity: number;

  constructor(cartId: string | 0, productId: number, quantity: number) {
    this.cartId = cartId !== 0 ? cartId : uuidv4();
    this.productId = productId;
    this.quantity = quantity;
  }
}

class Cart {
  cartId: string;
  customerId: number;

  constructor(cartId: string | 0, customerId: number) {
    this.cartId = cartId !== 0 ? cartId : uuidv4();
    this.customerId = customerId;
  }
}

class Order {
  orderId: string;
  customerId: number;

  constructor(orderId: string | 0, customerId: number) {
    this.orderId = orderId !== 0 ? orderId : uuidv4();
    this.customerId = customerId;
  }
}

// adding static data
const products: Product[] = [
  new Product("Product 1", 10.0, "Description of Product 1"),
  new Product("Product 2", 20.0, "Description of Product 2"),
  new Product("Product 3", 30.0, "Description of Product 3")
];

const orders: Order[] = [
  new Order("1", 1),
  new Order("0", 1),
  new Order("0", 2)
];

const carts: Cart[] = [];

const customers: Customer[] = [
  new Customer(1, "Customer 1", "email@example.com"),
  new Customer(2, "Customer 2", "email@example.com")
];

const categories: Category[] = [
  new Category("Category 1", "Description of Category 1"),
  new Category("Category 2", "Description of Category 2"),
  new Category("Category 3", "Description of Category 3")
];

const productCatalog = [
  {
    name: "Product 1",
    price: 10.0,
    description: "Description of Product 1",
    categoryId: 1
  },
  {
    name: "Product 2",
    price: 20.0,
    description: "Description of Product 2",
    categoryId: 2
  },
  {
    name: "Product 3",
    price: 30.0,
    description: "Description of Product 3",
    categoryId: 3
  }
];

const cartItems = [
  new CartItem("1", 1, 2),
  new CartItem("1", 2, 1)
];


// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

type Result = {
  type: "text";
  text: string;
}[];

// Add a tool to get orders
server.tool(
  "get_orders",
  { 
    customer_id: z.number().optional() 
  },
  async ({ customer_id = 0 }) => {
    if (customer_id !== 0 && !customers.some(customer => customer.id === customer_id)) {
      throw new Error(`Invalid customer_id: ${customer_id}`);
    }

    const filteredOrders = customer_id !== 0
      ? orders.filter(order => order.customerId === customer_id)
      : orders;

 
      

    const mapped = filteredOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      return {
        type: "text",
        text: `ID: ${order.orderId}, customer: ${customer ? customer.name : "Unknown"}`
      };
    }) as Result;

    return {
      content: mapped
    };
  }
);

server.tool(
  "get_order", 
  {
    orderId: z.string()
  }, 
  async ({ orderId }) => {
    const order = orders.find(order => order.orderId === orderId);

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const customer = customers.find(c => c.id === order.customerId);

    return {
      content: [{
        type: "text",
        text: `ID: ${order.orderId}, customer: ${customer ? customer.name : "Unknown"}`
      }]
    };
});

// Place order
server.tool(
  "place_order",
  {
    customer_id: z.number()
  },
  async ({ customer_id }) => {
    if (customer_id !== 0 && !customers.some(customer => customer.id === customer_id)) {
      throw new Error(`Invalid customer_id: ${customer_id}`);
    }

    const newOrder = new Order("0", customer_id);
    orders.push(newOrder);

    return {
      content: [{
        type: "text",
        text: `ID: ${newOrder.orderId}, customer: ${customer_id}`
      }]
    };
  });
  
// Get cart
server.tool(
  "get_cart",
  {
    customer_id: z.number()
  },
  async ({ customer_id }) => {
    if (customer_id !== 0 && !customers.some(customer => customer.id === customer_id)) {
      throw new Error(`Invalid customer_id: ${customer_id}`);
    }

    const cart = carts.find(cart => cart.customerId === customer_id);
    if (cart) {
      return {
        content: [{
          type: "text",
          text: `ID: ${cart.cartId}, customer: ${cart.customerId}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `No cart found for customer ID: ${customer_id}`
        }]
      };
    }
  }
);

// Get cart items
server.tool(
  "get_cart_items",
  {
    cart_id: z.string()
  },
  async ({ cart_id }) => {
    const items = cartItems.filter(item => item.cartId === cart_id);
    return {
      content: items.map(item => ({
        type: "text",
        text: `ID: ${item.cartId}, product: ${item.productId}, quantity: ${item.quantity}`
      }))
    };
  }
);

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

// Get all products
server.tool(
  "get_all_products",
  {},
  async () => {
    return {
      content: products.map(product => ({
        type: "text",
        text: `ID: ${product.name}, price: ${product.price}, description: ${product.description}`
      }))
    };
  }
);

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

// Get all categories
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

// Resource: Product Catalog
server.resource(
  "product_catalog",
  "resource://product_catalog",
  async (uri) => ({
    contents: productCatalog.map(product => ({
      uri: `resource:product_catalog/${product.name}`,
      text: `Name: ${product.name}, Price: ${product.price}, Description: ${product.description}, Category ID: ${product.categoryId}`
    }))
  })
);


// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
