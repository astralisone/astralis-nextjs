import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import type { IntegrationProvider } from '@/types/automation';

/**
 * Integration Service
 *
 * Manages OAuth credentials and API keys for third-party integrations.
 * Provides secure storage and retrieval of sensitive credential data.
 *
 * Features:
 * - Save encrypted credentials (OAuth tokens, API keys)
 * - Retrieve and decrypt credentials for use
 * - Manage credential lifecycle
 * - Handle OAuth token refresh
 *
 * Security:
 * - All credentials are encrypted using AES-256-GCM
 * - Encryption key derived from N8N_ENCRYPTION_KEY or NEXTAUTH_SECRET
 * - Credentials never returned unencrypted in API responses
 *
 * Note: Requires Phase 6 migration for IntegrationCredential table
 */

export interface SaveCredentialData {
  provider: IntegrationProvider;
  credentialName: string;
  credentialData: Record<string, any>;
  scope?: string;
  expiresAt?: Date;
}

export interface CredentialData {
  id: string;
  provider: IntegrationProvider;
  credentialName: string;
  scope: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialWithData extends CredentialData {
  credentialData: Record<string, any>; // Decrypted
}

export class IntegrationService {
  /**
   * Save encrypted credential
   *
   * Steps:
   * 1. Validate credential data
   * 2. Encrypt sensitive data
   * 3. Store in database
   * 4. Log activity
   */
  async saveCredential(
    userId: string,
    orgId: string,
    data: SaveCredentialData
  ): Promise<CredentialData> {
    try {
      console.log('[Integration Service] Saving credential:', data.provider, data.credentialName);

      // 1. Encrypt credential data
      const encryptedData = encrypt(JSON.stringify(data.credentialData));

      // 2. Save to database
      // Note: This is a placeholder - requires Phase 6 migration
      // After migration, this will use IntegrationCredential model
      console.log('[Integration Service] Credential encrypted and ready for storage');
      console.log('[Integration Service] Requires Phase 6 migration to save to database');

      // Placeholder return
      return {
        id: 'temp-id',
        provider: data.provider,
        credentialName: data.credentialName,
        scope: data.scope || null,
        expiresAt: data.expiresAt || null,
        isActive: true,
        lastUsedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      /* After Phase 6 migration:
      const credential = await prisma.integrationCredential.create({
        data: {
          userId,
          orgId,
          provider: data.provider,
          credentialName: data.credentialName,
          credentialData: encryptedData,
          scope: data.scope || null,
          expiresAt: data.expiresAt || null,
          isActive: true,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'CREATE',
          entity: 'INTEGRATION_CREDENTIAL',
          entityId: credential.id,
          metadata: {
            provider: data.provider,
            credentialName: data.credentialName,
          },
        },
      });

      return {
        id: credential.id,
        provider: credential.provider,
        credentialName: credential.credentialName,
        scope: credential.scope,
        expiresAt: credential.expiresAt,
        isActive: credential.isActive,
        lastUsedAt: credential.lastUsedAt,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
      */
    } catch (error) {
      console.error('[Integration Service] Failed to save credential:', error);
      throw new Error(
        `Failed to save credential: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get credentials for a provider
   *
   * Returns credentials WITHOUT decrypted data (safe for API responses)
   */
  async listCredentials(
    userId: string,
    orgId: string,
    provider?: IntegrationProvider
  ): Promise<CredentialData[]> {
    try {
      console.log('[Integration Service] Listing credentials for user:', userId);
      console.log('[Integration Service] Requires Phase 6 migration');

      // Placeholder return
      return [];

      /* After Phase 6 migration:
      const where: any = { userId, orgId };

      if (provider) {
        where.provider = provider;
      }

      const credentials = await prisma.integrationCredential.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          provider: true,
          credentialName: true,
          scope: true,
          expiresAt: true,
          isActive: true,
          lastUsedAt: true,
          createdAt: true,
          updatedAt: true,
          // Explicitly exclude credentialData
        },
      });

      return credentials;
      */
    } catch (error) {
      console.error('[Integration Service] Failed to list credentials:', error);
      throw new Error(
        `Failed to list credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get credential WITH decrypted data (internal use only)
   *
   * WARNING: Never expose this data in API responses!
   * Only use for n8n workflow execution.
   */
  async getCredentialWithData(
    credentialId: string,
    userId: string,
    orgId: string
  ): Promise<CredentialWithData | null> {
    try {
      console.log('[Integration Service] Getting credential with data:', credentialId);
      console.log('[Integration Service] Requires Phase 6 migration');

      return null;

      /* After Phase 6 migration:
      const credential = await prisma.integrationCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          orgId,
        },
      });

      if (!credential) {
        return null;
      }

      // Decrypt credential data
      const decryptedData = JSON.parse(decrypt(credential.credentialData));

      // Update last used timestamp
      await prisma.integrationCredential.update({
        where: { id: credentialId },
        data: { lastUsedAt: new Date() },
      });

      return {
        id: credential.id,
        provider: credential.provider,
        credentialName: credential.credentialName,
        scope: credential.scope,
        expiresAt: credential.expiresAt,
        isActive: credential.isActive,
        lastUsedAt: credential.lastUsedAt,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        credentialData: decryptedData,
      };
      */
    } catch (error) {
      console.error('[Integration Service] Failed to get credential:', error);
      throw new Error(
        `Failed to get credential: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Refresh OAuth token
   *
   * Updates access token and refresh token for OAuth-based credentials
   */
  async refreshToken(
    credentialId: string,
    userId: string,
    orgId: string,
    newAccessToken: string,
    newRefreshToken?: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      console.log('[Integration Service] Refreshing token for credential:', credentialId);
      console.log('[Integration Service] Requires Phase 6 migration');

      /* After Phase 6 migration:
      const credential = await prisma.integrationCredential.findFirst({
        where: { id: credentialId, userId, orgId },
      });

      if (!credential) {
        throw new Error('Credential not found');
      }

      // Decrypt existing data
      const credentialData = JSON.parse(decrypt(credential.credentialData));

      // Update tokens
      credentialData.accessToken = newAccessToken;
      if (newRefreshToken) {
        credentialData.refreshToken = newRefreshToken;
      }

      // Re-encrypt
      const encryptedData = encrypt(JSON.stringify(credentialData));

      // Update database
      await prisma.integrationCredential.update({
        where: { id: credentialId },
        data: {
          credentialData: encryptedData,
          expiresAt: expiresAt || null,
          lastUsedAt: new Date(),
        },
      });

      console.log('[Integration Service] Token refreshed successfully');
      */
    } catch (error) {
      console.error('[Integration Service] Failed to refresh token:', error);
      throw new Error(
        `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete credential
   */
  async deleteCredential(
    credentialId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    try {
      console.log('[Integration Service] Deleting credential:', credentialId);
      console.log('[Integration Service] Requires Phase 6 migration');

      /* After Phase 6 migration:
      const credential = await prisma.integrationCredential.findFirst({
        where: { id: credentialId, userId, orgId },
      });

      if (!credential) {
        throw new Error('Credential not found');
      }

      // Delete from database
      await prisma.integrationCredential.delete({
        where: { id: credentialId },
      });

      // Log deletion
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'DELETE',
          entity: 'INTEGRATION_CREDENTIAL',
          entityId: credentialId,
          metadata: {
            provider: credential.provider,
            credentialName: credential.credentialName,
          },
        },
      });

      console.log('[Integration Service] Credential deleted');
      */
    } catch (error) {
      console.error('[Integration Service] Failed to delete credential:', error);
      throw new Error(
        `Failed to delete credential: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const integrationService = new IntegrationService();
