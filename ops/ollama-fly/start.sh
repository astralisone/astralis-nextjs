#!/bin/bash

# Start Ollama in the background
ollama serve &

# Record Process ID
pid=$!

# Wait for Ollama to start
sleep 5

echo "🔴 Retrieving model: gemma3:1b..."
ollama pull gemma3:1b

echo "🟢 Model ready! Ollama is listening on port 11434"

# Wait for process
wait $pid
