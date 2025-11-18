import { z } from 'zod';

import { 
    OrderSchema, 
    CustomerSchema, 
    CartSchema, 
    CartItemSchema, 
    ProductSchema,
    CategorySchema
} from './tools/schema.js';

type Order = z.infer<typeof OrderSchema>;
type Customer = z.infer<typeof CustomerSchema>;
type Cart = z.infer<typeof CartSchema>;
type CartItem = z.infer<typeof CartItemSchema>;
type Product = z.infer<typeof ProductSchema>;
type Category = z.infer<typeof CategorySchema>;

export const orders: Array<Order> = [
    {
        id: '1',
        customerId: '1'
    },
    {
        id: '2',
        customerId: '1'
    }
];

export const customers: Array<Customer> = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com'
    }
];

export const carts: Array<Cart> = [
    {
        id: '1',
        customerId: '1'
    }
];

export const cartItems: Array<CartItem> = [
    {
        id: '1',
        productId: '1',
        quantity: 2,
        cartId: '1'
    },
    {
        id: '2',
        productId: '2',
        quantity: 1,
        cartId: '1'
    }
];

export const products: Array<Product> = [
    {
        id: '1',
        name: 'Product 1',
        price: 100,
        description: 'Description for Product 1'
    },
    {
        id: '2',
        name: 'Product 2',
        price: 200,
        description: 'Description for Product 2'
    }
];

export const categories: Array<Category> = [
    {
        id: '1',
        name: 'Category 1',
        description: 'Description for Category 1'
    },
    {
        id: '2',
        name: 'Category 2',
        description: 'Description for Category 2'
    }
];
