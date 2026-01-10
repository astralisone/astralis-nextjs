
import { BaseLLMClient } from './LLMClient';
import {
    LLMProvider,
    LLMResponse,
    LLMOptions,
    OllamaModel,
    ChatMessage,
    LLMError,
    TokenUsage,
    LLMFinishReason
} from '../types/agent.types';

/**
 * Configuration for Ollama client
 */
export interface OllamaClientConfig {
    /** Model to use (default: llama3) */
    model: OllamaModel;
    /** Base URL for Ollama API (default: http://127.0.0.1:11434) */
    baseUrl?: string;
    /** Default options */
    defaultOptions?: LLMOptions;
    /** Maximum retries */
    maxRetries?: number;
    /** Retry delay */
    retryBaseDelay?: number;
}

/**
 * Client for interacting with local Ollama instance.
 */
export class OllamaClient extends BaseLLMClient {
    public readonly provider = LLMProvider.OLLAMA;
    private readonly baseUrl: string;

    constructor(config: OllamaClientConfig) {
        super({
            model: config.model,
            // baseUrl is not in LLMClientConfig, we handle it in this class
            defaultOptions: config.defaultOptions,
            maxRetries: config.maxRetries,
            retryBaseDelay: config.retryBaseDelay,
        });

        this.baseUrl = config.baseUrl || 'http://127.0.0.1:11434';

        if (!this.model) {
            throw new LLMError(
                'Model name is required for Ollama client',
                'INVALID_CONFIG',
                this.provider
            );
        }
    }

    public isReady(): boolean {
        // Ideally we'd ping the health endpoint, but for synchronous check 
        // we assume it's ready if configured.
        // The health check utility handles async verification.
        return !!this.baseUrl;
    }

    protected async _complete(
        messages: ChatMessage[],
        options: LLMOptions
    ): Promise<LLMResponse> {

        // Transform messages to Ollama format
        // Ollama chat API expects { role, content, images? }
        const ollamaMessages = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const body = {
            model: this.model,
            messages: ollamaMessages,
            stream: false,
            options: {
                temperature: options.temperature,
                num_predict: options.maxTokens,
                top_p: options.topP,
                stop: options.stopSequences,
            }
        };

        // Diagnostic logging for local model debugging
        console.log(`[OllamaClient] Request Body:`, JSON.stringify(body, null, 2));

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Ollama response format for chat:
            // { model, created_at, message: { role, content }, done, total_duration, eval_count, ... }

            const usage: TokenUsage = {
                promptTokens: data.prompt_eval_count || 0,
                completionTokens: data.eval_count || 0,
                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
            };

            let finishReason: LLMFinishReason = 'stop';
            if (data.done_reason === 'stop') finishReason = 'stop';
            else if (data.done_reason === 'length') finishReason = 'length';

            return {
                content: data.message.content,
                usage,
                model: data.model,
                finishReason,
                raw: data
            };

        } catch (error) {
            // Network errors (like connection refused) are common with local servers
            if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ECONNREFUSED'))) {
                throw new LLMError(
                    `Could not connect to Ollama at ${this.baseUrl}. Is it running?`,
                    'CONNECTION_ERROR',
                    this.provider,
                    undefined,
                    true, // Retryable
                    error
                );
            }
            throw error;
        }
    }
}
