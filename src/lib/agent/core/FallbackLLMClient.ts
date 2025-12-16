
import { BaseLLMClient } from './LLMClient';
import {
    LLMProvider,
    LLMResponse,
    LLMOptions,
    ChatMessage,
    LLMError,
} from '../types/agent.types';
import { ILLMClient, RateLimitStatus } from './LLMClient';

/**
 * Client that wraps multiple LLM clients and attempts them in order.
 * If the primary client fails with a potentially recoverable error (or network error),
 * it fails over to the next client in the list.
 */
export class FallbackLLMClient implements ILLMClient {
    // We report the provider of the *current* active client, or generic fallback
    public get provider(): LLMProvider {
        return this.primaryClient.provider;
    }

    public get model(): string {
        return this.primaryClient.model;
    }

    private clients: ILLMClient[];

    constructor(clients: ILLMClient[]) {
        if (!clients || clients.length === 0) {
            throw new Error('FallbackLLMClient requires at least one client');
        }
        this.clients = clients;
    }

    private get primaryClient(): ILLMClient {
        return this.clients[0];
    }

    public isReady(): boolean {
        // Ready if at least one client is ready
        return this.clients.some(c => c.isReady());
    }

    public getRateLimitStatus(): RateLimitStatus {
        // Return status of primary client
        return this.primaryClient.getRateLimitStatus();
    }

    public async complete(
        messages: ChatMessage[],
        options?: LLMOptions
    ): Promise<LLMResponse> {
        const errors: Error[] = [];

        for (const client of this.clients) {
            try {
                if (!client.isReady()) {
                    console.log(`[FallbackLLMClient] Client ${client.provider} is not ready, skipping.`);
                    continue;
                }

                console.log(`[FallbackLLMClient] Attempting completion with ${client.provider}/${client.model}`);
                return await client.complete(messages, options);
            } catch (error) {
                console.warn(`[FallbackLLMClient] Client ${client.provider} failed:`, error);
                errors.push(error as Error);

                // If it was a validation error (e.g. invalid message format), don't fallback, as it will fail everywhere
                if (error instanceof Error && error.name === 'ValidationError') {
                    throw error;
                }
            }
        }

        throw new LLMError(
            `All fallback clients failed. Errors: ${errors.map(e => e.message).join(' | ')}`,
            'ALL_CLIENTS_FAILED',
            this.provider,
            undefined,
            false
        );
    }

    public async completeWithJSON<T>(
        messages: ChatMessage[],
        schema: any, // Using any for simplicity here to match interface
        options?: LLMOptions
    ): Promise<T> {
        const errors: Error[] = [];

        for (const client of this.clients) {
            try {
                if (!client.isReady()) continue;

                console.log(`[FallbackLLMClient] Attempting JSON completion with ${client.provider}/${client.model}`);
                return await client.completeWithJSON(messages, schema, options);
            } catch (error) {
                console.warn(`[FallbackLLMClient] Client ${client.provider} JSON completion failed:`, error);
                errors.push(error as Error);

                if (error instanceof Error && error.name === 'ValidationError') {
                    // If schema validation failed, it might be the model's fault, so we DO continue to next model
                    // unless it was input validation. 
                    // Ideally we distinguish, but for now we try next model.
                }
            }
        }

        throw new LLMError(
            `All fallback clients failed JSON completion. Errors: ${errors.map(e => e.message).join(' | ')}`,
            'ALL_CLIENTS_FAILED',
            this.provider,
            undefined,
            false
        );
    }
}
