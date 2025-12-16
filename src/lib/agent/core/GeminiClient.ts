
import { BaseLLMClient } from './LLMClient';
import {
    LLMProvider,
    LLMResponse,
    LLMOptions,
    GeminiModel,
    ChatMessage,
    LLMError,
    TokenUsage,
    LLMFinishReason
} from '../types/agent.types';

/**
 * Configuration for Gemini client
 */
export interface GeminiClientConfig {
    /** Model to use (default: gemini-1.5-flash) */
    model: GeminiModel;
    /** API Key (Google AI Studio) */
    apiKey?: string;
    /** Default options */
    defaultOptions?: LLMOptions;
    /** Maximum retries */
    maxRetries?: number;
    /** Retry delay */
    retryBaseDelay?: number;
}

/**
 * Client for interacting with Google Gemini API via REST.
 * We implement raw REST calls to avoid adding heavier dependencies unless needed.
 */
export class GeminiClient extends BaseLLMClient {
    public readonly provider = LLMProvider.GEMINI;
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor(config: GeminiClientConfig) {
        super({
            model: config.model,
            apiKey: config.apiKey,
            defaultOptions: config.defaultOptions,
            maxRetries: config.maxRetries,
            retryBaseDelay: config.retryBaseDelay,
        });

        this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || '';

        // Using v1beta for widest compatibility with 1.5 models
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    }

    public isReady(): boolean {
        return !!this.apiKey;
    }

    protected async _complete(
        messages: ChatMessage[],
        options: LLMOptions
    ): Promise<LLMResponse> {

        if (!this.apiKey) {
            throw new LLMError('Google API Key not configured', 'API_KEY_MISSING', this.provider);
        }

        // Transform messages to Gemini format
        // Gemini expects { contents: [ { role, parts: [{ text }] } ], ... }
        // Roles: 'user' -> 'user', 'model' -> 'model', 'system' -> (system instruction)

        const contents: any[] = [];
        let systemInstruction: any = undefined;

        for (const m of messages) {
            if (m.role === 'system') {
                // Gemini 1.5 supports system_instruction at top level
                systemInstruction = {
                    parts: [{ text: m.content }]
                };
            } else {
                contents.push({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                });
            }
        }

        const body = {
            contents,
            systemInitial: systemInstruction ? undefined : undefined, // Handled separately below if API supports it
            ...(systemInstruction && { systemInstruction }), // Only add if present
            generationConfig: {
                temperature: options.temperature,
                maxOutputTokens: options.maxTokens,
                topP: options.topP,
                stopSequences: options.stopSequences,
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Check for 429
                if (response.status === 429) {
                    // Extract headers if possible
                    throw new LLMError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', this.provider, undefined, true);
                }
                throw new Error(`Gemini API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Parse Gemini response
            // { candidates: [ { content: { parts: [ { text } ] }, finishReason, ... } ], usageMetadata: { ... } }

            const candidate = data.candidates?.[0];
            if (!candidate) {
                throw new LLMError('No candidates returned', 'EMPTY_RESPONSE', this.provider);
            }

            const content = candidate.content?.parts?.[0]?.text || '';

            const usage: TokenUsage = {
                promptTokens: data.usageMetadata?.promptTokenCount || 0,
                completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: data.usageMetadata?.totalTokenCount || 0,
            };

            // Map finish reason
            let finishReason: LLMFinishReason = 'stop';
            if (candidate.finishReason === 'MAX_TOKENS') finishReason = 'length';
            else if (candidate.finishReason === 'SAFETY') finishReason = 'content_filter';
            else if (candidate.finishReason === 'RECITATION') finishReason = 'content_filter';

            return {
                content,
                usage,
                model: this.model,
                finishReason,
                raw: data
            };

        } catch (error) {
            if (error instanceof LLMError) throw error;
            throw this.normalizeError(error as Error);
        }
    }
}
