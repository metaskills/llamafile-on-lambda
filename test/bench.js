import { OpenAI } from "openai";

// Configuration
const LAMBDA_FUNCTION_URL = process.env.LAMBDA_FUNCTION_URL;
const TEST_DURATION = 600000; // 10 minutes in milliseconds
const MAX_REQUESTS = 20;

const baseURL = LAMBDA_FUNCTION_URL.endsWith("/")
  ? LAMBDA_FUNCTION_URL
  : `${LAMBDA_FUNCTION_URL}/`;
const openai = new OpenAI({ baseURL: `${baseURL}v1`, apiKey: "no-key" });

async function sendMessage() {
  const messages = [{ role: "user", content: "Hello" }];

  try {
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
      assistantResponse += content;
    }

    console.log(`Response received (${assistantResponse.length} characters)`);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function runTest() {
  const startTime = Date.now();

  while (Date.now() - startTime < TEST_DURATION) {
    const numRequests = Math.floor(Math.random() * MAX_REQUESTS) + 1;

    console.log(`Sending ${numRequests} requests...`);
    const promises = Array(numRequests)
      .fill()
      .map(() => sendMessage());
    await Promise.all(promises);

    // Random sleep between 1-5 seconds
    const sleepTime = Math.random() * 4000 + 1000;
    console.log(`Sleeping for ${Math.round(sleepTime / 1000)} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }

  console.log("Test completed.");
}

runTest().catch(console.error);
