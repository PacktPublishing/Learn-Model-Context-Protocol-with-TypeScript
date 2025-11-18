/*
Run this model in Javascript

> npm install openai
*/
import OpenAI from "openai";
import process from "node:process";

// To authenticate with the model you will need to generate a personal access token (PAT) in your GitHub settings. 
// Create your PAT token by following instructions here: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
const token = process.env["GITHUB_TOKEN"];

export async function callLLM(prompt: string, systemPrompt: string): Promise<string | null> {

  const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: token
  });

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: systemPrompt },
      { role:"user", content: prompt }
    ],
    model: "openai/gpt-4o-mini",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1
  });

  return response.choices[0].message.content;
}

