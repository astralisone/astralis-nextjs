FROM ollama/ollama:latest

# Set working directory
WORKDIR /app

# Copy startup script
COPY start.sh /app/start.sh

# Make executable
RUN chmod +x /app/start.sh

# Expose API port
EXPOSE 11434

# Use the startup script as entrypoint
ENTRYPOINT ["/app/start.sh"]
