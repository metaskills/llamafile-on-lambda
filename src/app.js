import { spawn } from "child_process";

async function startLlamafile() {
  return new Promise((resolve) => {
    const llamafile = spawn("/opt/llamafile/command", [], { shell: true });
    llamafile.stdout.pipe(process.stdout);
    llamafile.stderr.pipe(process.stderr);
    llamafile.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("llama server listening")) {
        resolve();
      }
    });
    llamafile.on("error", (err) => {
      console.error("Failed to start Llamafile process:", err);
      resolve();
    });
  });
}

await startLlamafile();

export const handler = async (_event, _context) => {
  // Your Lambda logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda!" }),
  };
};
