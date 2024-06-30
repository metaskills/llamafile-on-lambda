import { OpenAI } from "openai";
import inquirer from "inquirer";

const baseURL = process.env.BASE_URL?.length
  ? process.env.BASE_URL
  : "http://localhost:8080";

const openai = new OpenAI({ baseURL: `${baseURL}/v1`, apiKey: "no-key" });

const messages = [
  {
    role: "system",
    content:
      "<|system|>\nBe very brief in your responses. No long explanations.<|end|>",
  },
];

async function streamCompletion(messages) {
  const stream = await openai.chat.completions.create({
    model: "LLaMA_CPP",
    messages: messages,
    stream: true,
  });
  let assistantResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(content);
    assistantResponse += content;
  }
  process.stdout.write("\n");
  messages.push({ role: "assistant", content: assistantResponse });
}

async function chat() {
  while (true) {
    const { userInput } = await inquirer.prompt([
      { type: "input", name: "userInput", message: ">" },
    ]);
    if (userInput.toLowerCase() === "exit") {
      break;
    }
    messages.push({
      role: "user",
      content: `<|user|>\n${userInput}<|end|>\n<|assistant|>`,
    });
    await streamCompletion(messages);
  }
}

chat();
