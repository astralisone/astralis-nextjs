# LLM Agent Debug Logging

## Overview

Enhanced logging has been added to all LLM agents (Gemini, OpenAI, Claude, Ollama) to help debug message truncation and other issues. The logging is implemented in the base `BaseLLMClient` class, so it automatically applies to all providers.

## How to Enable

Set the environment variable `LLM_DEBUG_LOGGING=true` to enable detailed request/response logging.

### For Development Server

```bash
# In your .env.local file
LLM_DEBUG_LOGGING=true

# Or run directly
LLM_DEBUG_LOGGING=true npm run dev
```

### For Production

```bash
LLM_DEBUG_LOGGING=true npm run start
```

## What Gets Logged

### Without Debug Logging (Default)
- Request ID and basic info
- Message count and model
- Completion time and token usage

### With Debug Logging Enabled
- **Request Details:**
  - Provider and model
  - Full options object (temperature, maxTokens, etc.)
  - All messages with role and content (truncated to 500 chars per message)
  
- **Response Details:**
  - Finish reason
  - Latency in milliseconds
  - Token usage breakdown (prompt, completion, total)
  - Full response content (truncated to 2000 chars)

## Example Log Output

```
[LLMClient] [GEMINI-1765958292702-pn06zi] Starting completion request
[LLMClient] [GEMINI-1765958292702-pn06zi] Messages: 3, Model: gemini-1.5-flash
[LLMClient] [GEMINI-1765958292702-pn06zi] ========== REQUEST DETAILS ==========
[LLMClient] [GEMINI-1765958292702-pn06zi] Provider: GEMINI
[LLMClient] [GEMINI-1765958292702-pn06zi] Model: gemini-1.5-flash
[LLMClient] [GEMINI-1765958292702-pn06zi] Options: {
  "temperature": 0.7,
  "maxTokens": 2000,
  "timeout": 30000
}
[LLMClient] [GEMINI-1765958292702-pn06zi] Messages (3 total):
[LLMClient] [GEMINI-1765958292702-pn06zi]   [0] Role: system
[LLMClient] [GEMINI-1765958292702-pn06zi]   [0] Content: You are a helpful assistant...
[LLMClient] [GEMINI-1765958292702-pn06zi]   [1] Role: user
[LLMClient] [GEMINI-1765958292702-pn06zi]   [1] Content: Hello, how are you?
[LLMClient] [GEMINI-1765958292702-pn06zi]   [2] Role: assistant
[LLMClient] [GEMINI-1765958292702-pn06zi]   [2] Content: I'm doing well, thank you!...
[LLMClient] [GEMINI-1765958292702-pn06zi] =====================================
[LLMClient] [GEMINI-1765958292702-pn06zi] Completed successfully in 1234ms
[LLMClient] [GEMINI-1765958292702-pn06zi] Tokens used: 150
[LLMClient] [GEMINI-1765958292702-pn06zi] ========== RESPONSE DETAILS ==========
[LLMClient] [GEMINI-1765958292702-pn06zi] Finish Reason: stop
[LLMClient] [GEMINI-1765958292702-pn06zi] Latency: 1234ms
[LLMClient] [GEMINI-1765958292702-pn06zi] Token Usage:
[LLMClient] [GEMINI-1765958292702-pn06zi]   - Prompt Tokens: 50
[LLMClient] [GEMINI-1765958292702-pn06zi]   - Completion Tokens: 100
[LLMClient] [GEMINI-1765958292702-pn06zi]   - Total Tokens: 150
[LLMClient] [GEMINI-1765958292702-pn06zi] Response Content:
[LLMClient] [GEMINI-1765958292702-pn06zi] I'm doing well, thank you for asking!...
[LLMClient] [GEMINI-1765958292702-pn06zi] ======================================
```

## Implementation Details

- **File Modified:** `src/lib/agent/core/LLMClient.ts`
- **Method Enhanced:** `BaseLLMClient.complete()`
- **New Helper Method:** `truncateForLog()` - safely truncates long content to prevent log spam
- **Applies To:** All LLM providers (Gemini, OpenAI, Claude, Ollama)

## Troubleshooting

If you're not seeing the detailed logs:
1. Verify `LLM_DEBUG_LOGGING=true` is set in your environment
2. Restart your development server
3. Check that you're looking at server logs (not browser console)
4. Ensure the chat agent is actually making LLM calls
