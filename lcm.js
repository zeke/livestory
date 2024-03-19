import WebSocket from "ws";
import fs from "fs";
const ws = new WebSocket("ws://100.76.41.44:5000");

const prompts = [
  "A beautiful sunset over the ocean",
  "A cute puppy playing in the park",
  "A futuristic city skyline at night",
];

let promptIndex = 0;

ws.on("open", () => {
  console.log("Connected to WebSocket server");
  sendNextPrompt();
});

ws.on("message", (data) => {
  const fileName = `image_${promptIndex}.png`;
  fs.writeFile(fileName, data, (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
    } else {
      console.log(`Image saved as ${fileName}`);
      promptIndex++;
      sendNextPrompt();
    }
  });
});

ws.on("close", () => {
  console.log("Disconnected from WebSocket server");
});

function sendNextPrompt() {
  if (promptIndex < prompts.length) {
    const prompt = prompts[promptIndex];
    const message = JSON.stringify({ prompt: prompt });
    ws.send(message);
  } else {
    ws.close();
  }
}
