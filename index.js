import { spawn } from "child_process";
import stripAnsi from "strip-ansi";
// import Replicate from "replicate";
import dotenv from "dotenv";
// import download from 'download'
import path from "path";
import WebSocket from "ws";
import fs from "fs";
dotenv.config();

const ws = new WebSocket("ws://100.76.41.44:5000");
// const replicate = new Replicate();
const outputDirectory = "./output";
let frameNumber = 0;

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
  const uniqueFileName = `coreweave_output_${frameNumber}.jpg`;
  fs.writeFileSync(path.join(outputDirectory, uniqueFileName), data);
  fs.writeFileSync(path.join(outputDirectory, "_latest.jpg"), data);
  console.log(`Image saved as ${uniqueFileName}`);
  frameNumber += 1;
});

async function makeImage(prompt) {
  const lastImagePath = path.join(
    outputDirectory,
    `coreweave_output_${frameNumber - 1}.jpg`
  );

  let image;

  if (frameNumber === 0) {
    // image = fs.readFileSync("./circle.jpg").toString("base64");
    image = undefined;
  } else if (!fs.existsSync(lastImagePath)) {
    console.log("CANT FIND IMAGE!!!!!!!!!!", lastImagePath);
  } else {
    image = fs.readFileSync(lastImagePath).toString("base64");
  }

  ws.send(JSON.stringify({ prompt, image }));
}

// async function makeReplicateImage(prompt) {
//   console.log("Running on replicate");
//   const input = {
//     prompt,
//   };
//   const output = await replicate.run(
//     "fofr/latent-consistency-model:683d19dc312f7a9f0428b04429a9ccefd28dbf7785fef083ad5cf991b65f406f",
//     { input }
//   );

//   console.log(output);

//   for (const url of output) {
//     const filename = "replicate_output.png";
//     await download(url, "./output/", { filename });
//   }
// }

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
  } else {
    await makeImage(crazyWhisperPrompt);
  }

  //   await makeReplicateImage(crazyWhisperPrompt);
}

// Whisper.cpp stuff
const listen = spawn("sh", ["./listen.sh"]);

listen.stdout.on("data", async (chunk) => {
  generateImage(String(chunk));
});

listen.stdout.on("end", () => {});
