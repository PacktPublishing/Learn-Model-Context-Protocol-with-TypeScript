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
[CLIENT]:  {
  method: 'sampling/createMessage',
  params: { messages: [ [Object] ], maxTokens: 500 }
}
create_product::RESULT
{
  content: [
    {
      type: 'text',
      text: 'Created product: tomato, red, juicy, Client LLM: **Product Name: Juicy Red Tomato**\n' +
        '\n' +
        '**Description:**\n' +
        '\n' +
        'Indulge in the vibrant taste of summer with our exquisite Juicy Red Tomato. Plucked at the peak of ripeness, each tomato bursts with flavor, offering a refreshing, sweet, and slightly tart profile that will elevate any dish. Whether you’re adding them to a fresh salad, a savory pasta sauce, or simply enjoying them sliced with a sprinkle of salt, these tomatoes are the epitome of juiciness. \n' +
        '\n' +
        'Their deep red color not only signifies exceptional quality, but it also promises a wealth of nutrients. Packed with vitamins C and K, and loaded with antioxidants, our Juicy Red Tomatoes are the perfect guilt-free addition to your meals. Savor the natural goodness and let your culinary creativity blossom with these garden-fresh delights. \n' +
        '\n' +
        'Treat yourself and your loved ones to the unmatched taste of our Juicy Red Tomatoes— where every bite is a burst of nature’s goodness!'
    }
  ]
}
get_products::RESULT
{
  content: [
    {
      type: 'text',
      text: 'Product: tomato, Keywords: red, juicy, Description: Client LLM: **Product Name: Juicy Red Tomato**\n' +
        '\n' +
        '**Description:**\n' +
        '\n' +
        'Indulge in the vibrant taste of summer with our exquisite Juicy Red Tomato. Plucked at the peak of ripeness, each tomato bursts with flavor, offering a refreshing, sweet, and slightly tart profile that will elevate any dish. Whether you’re adding them to a fresh salad, a savory pasta sauce, or simply enjoying them sliced with a sprinkle of salt, these tomatoes are the epitome of juiciness. \n' +
        '\n' +
        'Their deep red color not only signifies exceptional quality, but it also promises a wealth of nutrients. Packed with vitamins C and K, and loaded with antioxidants, our Juicy Red Tomatoes are the perfect guilt-free addition to your meals. Savor the natural goodness and let your culinary creativity blossom with these garden-fresh delights. \n' +
        '\n' +
        'Treat yourself and your loved ones to the unmatched taste of our Juicy Red Tomatoes— where every bite is a burst of nature’s goodness!'
    }
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