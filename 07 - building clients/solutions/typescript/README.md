# Running sample

Here are instructions to run the sample.

## -1- Install the dependencies

```bash
npm install
```

## -3- Run the sample


```bash
npm run build
```

Stop (Ctrl+C) the process when it's done building the files.

## -4- Test the sample


1. To test the sample, type the following command:

  ```sh
  npm run client
  ```

1. Type `h` to list all the features, you should see an outcome like so:

  ```text
  FEATURES
  products, get products by category
  cart-list, get products in cart
  cart-add, Adding products to cart
  add, undefined
  ```

1. Type `products`, you should see the following text:

  ```text
  Provide argument for "category"
  ```

  Type **books**, you should see the following response:

  ```text
  RESULT
  {
    content: [ { type: 'text', text: 'Red ridinghood,Three musketeers' } ]
  }
  ```

1. Let's add this product to the cart, first type **cart-add**:

  You should see an outcome like so:

  ```text
  Provide argument for "title"
  ```

  Type **Red**, you should see the following outcome:

  ```text
  RESULT
  { content: [ { type: 'text', text: 'Added Red ridinghood to cart' } ] }
  ```

  Your item has been added to the cart. Try typing **cart-list** to list the cart content.

## -5- Test the LLm client

1. Start the LLM client with the following command:

  ```sh
  npm run client-llm
  ```

1. Type the following command **show me books** in the app like so:

  ```text
  Provide user prompt (type h for help or quit to stop): show me books
  ```

  You should see the following result:

  ```text
  Querying LLM:  show me books
  Making tool call
  Calling tool "products" with args "{\"category\":\"books\"}"

  Tool result:  {
    content: [ { type: 'text', text: 'Red ridinghood,Three musketeers' } ]
  }
  ```

1. Add an item to the cart by typing the following input **Add Red to cart**

  ```text
   Provide user prompt (type h for help or quit to stop):  Add Red to cart
  ```

  You should see a result similar to:

  ```text
  Querying LLM:  add Red to cart
  Making tool call
  Calling tool "cart-add" with args "{\"title\":\"Red\"}"

  Tool result:  { content: [ { type: 'text', text: 'Added Red ridinghood to cart' } ] }
  ```

  Here you can see based on the response that the item was added to the cart. Note also how we didn't have to type the full product name (this is an implementation detail in the server).

1. Let's make sure the cart content is correct by typing **show me cart content**, you should see a response similar to:

  ```text
  Querying LLM:  show me cart content
  Making tool call
  Calling tool "cart-list" with args "{}"

  Tool result:  { content: [ { type: 'text', text: 'Red ridinghood' } ] }
  ```
