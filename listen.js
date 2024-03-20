import stripAnsi from 'strip-ansi'
import { spawn } from 'child_process'

const whisperProcess = spawn('./whisper.cpp/stream', [
  '-m', './whisper.cpp/models/ggml-base.en.bin',
  '--step', '500',
  '--length', '5000'
])

const blurbs = []

whisperProcess.stdout.on('data', (data) => {
  const blurb = stripAnsi(data.toString()).trim()

  // ignore things like [SILENCE] and [START SPEAKING] and (gentle music)
  if (!blurb) return
  if (blurb.startsWith('(') && blurb.endsWith(')')) return
  if (blurb.startsWith('[') && blurb.endsWith(']')) return

  // remove previous blurb if this blurb is a retroactive correction
  const previousBlurb = blurbs.length && blurbs[blurbs.length - 1]
  const currentBlurbIsACorrection = previousBlurb && blurb.startsWith(previousBlurb.slice(0, -10))
  if (currentBlurbIsACorrection) blurbs.pop()

  blurbs.push(blurb)
  console.log({ blurbs })
})
