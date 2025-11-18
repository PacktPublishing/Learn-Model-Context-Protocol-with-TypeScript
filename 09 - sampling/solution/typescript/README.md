# Run sample

## Install dependencies

Note: make sure you run this in a GitHub Codespace environment or set up a personal access token, https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens 

```sh
npm install
```

## Start the app

```sh
npm run build
npm run client
```

You should see an output similar to:

```text
{
  content: [
    {
      type: 'text',
      text: 'Client response: Client LLM: **Product Name:** Ruby Delight Tomatoes\n' +
        '\n' +
        '**Product Description:**\n' +
        '\n' +
        "Experience the burst of flavor with our Ruby Delight Tomatoes, the epitome of freshness and taste. These vibrant red gems are not just visually stunning but are also packed with juicy goodness that will elevate any dish. Grown under the sun's nurturing rays, our tomatoes are handpicked at the peak of ripeness, ensuring every bite is a succulent explosion of flavor.\n" +
        '\n' +
        'Perfectly sweet with just the right amount of tang, Ruby Delight Tomatoes are versatile enough for salads, sauces, and everything in between. Their rich color and plump texture make them an eye-catching addition to your culinary creations or a delicious snack all on their own. Whether you’re a seasoned chef or a home cooking enthusiast, these tomatoes will inspire you to craft dishes that are both beautiful and delicious.\n' +
        '\n' +
        'Indulge in the true taste of summer year-round with our Ruby Delight Tomatoes—where every bite is a celebration of juicy perfection! Perfect for health-conscious consumers, these tomatoes are low in calories and high in vitamins, making them a guilt-free addition to your diet. Don’t miss out on the chance to savor the flavor; elevate your meals with Ruby Delight Tomatoes today!'
    },
    { type: 'text', text: 'Created product: tomato, red, juicy' }
  ]
}
```

For other outputs, locate this code in *client.ts*:

```typescript
const result = await client.callTool({
    name: "create_product",
    arguments: {
        "name": "tomato",
        "keywords": "red, juicy"
    }
});
```

here you can change what arguments are sent if you want to test a different product and different keywords