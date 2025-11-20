import { z } from 'zod';

export const MathInputSchema = z.object({ a: z.number(), b: z.number() });
export const EchoInputSchema = z.object({ message: z.string() });

export const OrderSchema = z.object({
    id: z.string(),
    customerId: z.string()
}); 

export const CartSchema = z.object({
    customerId: z.string(),
    id: z.string(),
});

export const CartItemSchema = z.object({
    id: z.string(),
    productId: z.string(),
    quantity: z.number(),
    cartId: z.string()
});

export const CartItemInputSchema = z.object({
    cartId: z.string(),
    productId: z.string(),
    quantity: z.number()
});

export const CartItemsInputSchema = z.object({
    cartId: z.string(),
    cartItemId: z.string()
});

export const CartsInputSchema = z.object({
    customerId: z.string()
});

export const OrdersInputSchema = z.object({
    customerId: z.string()
});

export const OrderInputSchema = z.object({
    orderId: z.string()
});

export const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
}); 

export const PlaceOrderInputSchema = z.object({
    customerId: z.string()
});

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string().optional()
});

export const ProductInputSchema = z.object({
    productId: z.string()
});

export const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional()
});
