#!/bin/bash

# Start Ollama in the background
ollama serve &

# Record Process ID
pid=$!

# Wait for Ollama to start
sleep 5

echo "🔴 Retrieving model: llama4-scout..."
ollama pull llama4-scout

echo "🟢 Model ready! Ollama is listening on port 11434"

# Wait for process
wait $pid
