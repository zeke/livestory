import { spawn } from 'child_process'
import stripAnsi from 'strip-ansi'
import Replicate from 'replicate'
import dotenv from 'dotenv'
import download from 'download'
import fs from 'fs'
import path from 'path'
dotenv.config()

const replicate = new Replicate()

const outputDirectory = './output'

fs.readdir(outputDirectory, (err, files) => {
  if (err) throw err

  for (const file of files) {
    fs.unlink(path.join(outputDirectory, file), err => {
      if (err) throw err
    })
  }
})

const outputs = []
const model = 'fofr/latent-consistency-model:683d19dc312f7a9f0428b04429a9ccefd28dbf7785fef083ad5cf991b65f406f'

async function makeImage (prompt) {
  const input = {
    prompt,
    image: outputs.length > 0 ? outputs[outputs.length - 1][0] : undefined,
    // control_image: outputs.length > 0 ? outputs[outputs.length - 1][0] : undefined
  }
  console.log({ model, input })
  console.log('Running...')
  const output = await replicate.run(model, { input })
  outputs.push(output)
  console.log('Done!', output)
  return output
}

let speechData = ''

const listen = spawn('sh', ['./listen.sh'])

listen.stdout.on('data', async (chunk) => {
  speechData += chunk
  console.log(String(chunk))
})

listen.stdout.on('end', () => {
  console.log(speechData)
})

process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.on('data', (key) => {
  if (key.toString() === '\u0003' || key.toString() === '\r') {
    process.exit()
  }
  if (key.toString() === ' ') {
    console.log('Space bar was pressed')
    generateImage()
  }
})

async function generateImage () {
  // create prompt from collected speech data
  const crazyWhisperPrompt = stripAnsi(speechData)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\[.*?\]/g, '')
    .split('.')
    .map(sentence => sentence.trim())
    .filter((sentence, index, self) => self.indexOf(sentence) === index)
    .join('. ')
    .trim()

  if (!crazyWhisperPrompt.length) {
    console.log('no prompt yet!')
    return
  }

  // Use a language model to clean up the input
  const input = {
    prompt: `Clean this up into a nice sentence. Don't explain yourself.\n\n${crazyWhisperPrompt}`
  }
  const llmResponse = (await replicate.run('mistralai/mixtral-8x7b-instruct-v0.1', { input })).join('')
  const aesthetic = "brightly-colored oil painting; abstract expressionism"
  const prompt = `${llmResponse}\n\n${aesthetic}`

  // reset speech data
  speechData = ''

  const output = await makeImage(prompt)

  for (const url of output) {
    const extension = url.split('.').pop()
    const urlSegments = url.split('/')
    const secondToLastSegment = urlSegments[urlSegments.length - 2]
    const slugifiedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100)
    const filename = `${secondToLastSegment}-${slugifiedPrompt}.${extension}`
    await download(url, './output/', { filename })
  }
}
