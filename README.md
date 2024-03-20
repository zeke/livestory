# Livestory

Tell a story and get a live feed of images

## Setup

```
git clone https://github.com/zeke/livestory
cd livestory
npm install
```

## Usage

1. Run `npm start`
1. Start talking
1. Hit <kbd>space</kbd> to generate an image
1. Hit <kbd>return</kbd> when you're done


## What tools are used?

- WhisperCPP
- SDXL Turbo on Coreweave
- LCM (different versions) on Replicate

## Learnin's

- Whisper CPP is easy to get running locally, and it's pretty fast.
- Whisper CPP shell output is kinda hard to deal with. It retroactively autocorrects.
- LCM default styles are leaning towards NSFW
- Running models on a Coreweave instance is faster than Replicate
- There are multiple LCM models. Looks like Lucataco version is faster than fofr version. Why?

