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
    const startTime = process.hrtime.bigint();

    const response = await openai.chat.completions.create({
      model: "LLaMA_CPP",
      messages: messages,
      stream: false,
      temperature: 0.1,
    });

    const endTime = process.hrtime.bigint();
    const totalTime = Number(endTime - startTime) / 1e6; // Convert to milliseconds

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response structure");
    }

    const assistantResponse = response.choices[0].message.content;
    const tokenCounts = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    console.log(`Response received (${assistantResponse.length} characters)`);
    console.log(
      `Time to first token (cold start approximation): ${totalTime.toFixed(
        2
      )} ms`
    );
    console.log(`Input tokens: ${tokenCounts.prompt_tokens}`);
    console.log(`Output tokens: ${tokenCounts.completion_tokens}`);
    console.log(`Total tokens: ${tokenCounts.total_tokens}`);

    return {
      timeToFirstToken: totalTime,
      tokenCounts: tokenCounts,
    };
  } catch (error) {
    console.error("Error sending message:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    return null;
  }
}

async function runTest() {
  const startTime = Date.now();
  let totalRequests = 0;
  let successfulRequests = 0;
  let totalTimeToFirstToken = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;

  while (Date.now() - startTime < TEST_DURATION) {
    const numRequests = Math.floor(Math.random() * MAX_REQUESTS) + 1;

    console.log(`Sending ${numRequests} requests...`);
    const promises = Array(numRequests)
      .fill()
      .map(() => sendMessage());
    const results = await Promise.all(promises);

    totalRequests += numRequests;
    results.forEach((result) => {
      if (result) {
        successfulRequests++;
        totalTimeToFirstToken += result.timeToFirstToken;
        totalInputTokens += result.tokenCounts.prompt_tokens;
        totalOutputTokens += result.tokenCounts.completion_tokens;
        totalTokens += result.tokenCounts.total_tokens;
      }
    });

    // Random sleep between 1-5 seconds
    const sleepTime = Math.random() * 4000 + 1000;
    console.log(`Sleeping for ${Math.round(sleepTime / 1000)} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }

  console.log("\nTest completed. Summary:");
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Successful requests: ${successfulRequests}`);
  console.log(`Failed requests: ${totalRequests - successfulRequests}`);
  if (successfulRequests > 0) {
    console.log(
      `Average time to first token: ${(
        totalTimeToFirstToken / successfulRequests
      ).toFixed(2)} ms`
    );
    console.log(
      `Average input tokens: ${(totalInputTokens / successfulRequests).toFixed(
        2
      )}`
    );
    console.log(
      `Average output tokens: ${(
        totalOutputTokens / successfulRequests
      ).toFixed(2)}`
    );
    console.log(
      `Average total tokens: ${(totalTokens / successfulRequests).toFixed(2)}`
    );
  } else {
    console.log("No successful requests to calculate averages.");
  }
}

runTest().catch(console.error);
