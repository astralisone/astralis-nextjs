#!/bin/bash

# Start Ollama in the background
ollama serve &

# Record Process ID
pid=$!

# Wait for Ollama to start
sleep 5

echo "🔴 Retrieving model: gemini-3-flash-preview:cloud..."
ollama pull gemini-3-flash-preview:cloud

echo "🟢 Model ready! Ollama is listening on port 11434"

# Wait for process
wait $pid
