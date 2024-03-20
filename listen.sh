if [ ! -d "whisper.cpp" ]; then
  echo "whisper.cpp not found. To download and build it, run script/bootstrap"
  exit
fi

cd whisper.cpp
./stream -m ./models/ggml-base.en.bin -t 8 --step 500 --length 5000
