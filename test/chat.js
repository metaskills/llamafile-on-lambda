import { OpenAI } from "openai";
import inquirer from "inquirer";

async function getBaseURL() {
  const { baseURL } = await inquirer.prompt([
    {
      type: "input",
      name: "baseURL",
      message: "Enter the base URL:",
      default: "http://localhost:8080/",
    },
  ]);
  return baseURL;
}

const baseURL = await getBaseURL();
const openai = new OpenAI({ baseURL: `${baseURL}v1`, apiKey: "no-key" });
const messages = [];

async function streamCompletion() {
  const stream = await openai.chat.completions.create({
    model: "LLaMA_CPP",
    messages: messages,
    stream: true,
    stop: ["<|assistant|>", "<|end|>"],
    temperature: 0.1,
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
      { type: "input", name: "userInput", message: "Message: >" },
    ]);
    if (userInput.toLowerCase() === "exit") {
      break;
    }
    messages.push({ role: "user", content: userInput });
    await streamCompletion();
  }
}

chat();
