const http = require("http");

exports.handler = async (event, context) => {
  try {
    const prompt = event.prompt || "Hello, how are you?";
    const response = await queryLlamafile(prompt);
    return {
      statusCode: 200,
      body: JSON.stringify({ result: response }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

function queryLlamafile(prompt) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 8080,
      path: "/completion",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(data).completion);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(JSON.stringify({ prompt }));
    req.end();
  });
}
