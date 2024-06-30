import { OpenAI } from "openai";

const openai = new OpenAI({
  baseURL: "http://localhost:8080/v1",
  apiKey: "no-key",
});

const response = await openai.chat.completions.create({
  model: "LLaMA_CPP",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hi, my name is Ken." },
  ],
});

console.log(response);
