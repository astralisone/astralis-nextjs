FROM n8nio/n8n:latest

USER root

# Install any extra tools if needed
RUN apk add --no-cache curl

# Create custom nodes directory if it doesn't exist and copy content
RUN mkdir -p /home/node/.n8n/custom
COPY ./n8n-custom-nodes /home/node/.n8n/custom

# Ensure correct permissions
RUN chown -R node:node /home/node/.n8n

USER node
