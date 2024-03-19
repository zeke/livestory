import { spawn } from "child_process";
import stripAnsi from "strip-ansi";
import Replicate from "replicate";
import dotenv from "dotenv";
import download from "download";
import path from "path";
import WebSocket from "ws";
import fs from "fs";

dotenv.config();

const ws = new WebSocket("ws://100.76.41.44:5000");
const replicate = new Replicate();
const outputDirectory = "./output";

// clean up output dir
fs.readdir(outputDirectory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(outputDirectory, file), (err) => {
      if (err) throw err;
    });
  }
});

ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

ws.on("message", (data) => {
  const fileName = `image_coreweave.png`;
  fs.writeFile(fileName, data, (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
    } else {
      console.log(`Image saved as ${fileName}`);
    }
  });
});

async function makeImage(prompt) {
  console.log("Running...");
  ws.send(JSON.stringify({ prompt: prompt }));
}

async function makeReplicateImage(prompt) {
  console.log("Running on replicate");
  const input = {
    prompt: prompt,
  };
  const output = await replicate.run("mistralai/mixtral-8x7b-instruct-v0.1", {
    input,
  });
  console.log(output);
}

const listen = spawn("sh", ["./listen.sh"]);

listen.stdout.on("data", async (chunk) => {
  console.log(String(chunk));
  generateImage(String(chunk));
});

listen.stdout.on("end", () => {
  console.log(speechData);
});

async function generateImage(speechData) {
  const crazyWhisperPrompt = stripAnsi(speechData)
    .replace(/[\r\n]+/g, " ")
    .replace(/\[.*?\]/g, "")
    .split(".")
    .map((sentence) => sentence.trim())
    .filter((sentence, index, self) => self.indexOf(sentence) === index)
    .join(". ")
    .trim();

  if (!crazyWhisperPrompt.length) {
    console.log("no prompt yet!");
    return;
  }

  await makeImage(crazyWhisperPrompt);
}
