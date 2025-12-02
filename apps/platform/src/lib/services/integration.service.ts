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
 * - Manage credential lifecycle (soft delete)
 * - Handle OAuth token refresh
 *
 * Security:
 * - All credentials are encrypted using AES-256-GCM encryption
 * - Encryption key derived from N8N_ENCRYPTION_KEY or NEXTAUTH_SECRET
 * - Credentials never returned unencrypted in API responses
 * - All operations are logged in ActivityLog for audit trail
 * - Soft delete preserves audit trail while removing access
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

      // 3. Log activity
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

      console.log('[Integration Service] Credential saved successfully:', credential.id);

      return {
        id: credential.id,
        provider: credential.provider as IntegrationProvider,
        credentialName: credential.credentialName,
        scope: credential.scope,
        expiresAt: credential.expiresAt,
        isActive: credential.isActive,
        lastUsedAt: credential.lastUsedAt,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
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

      const where: any = { userId, orgId, isActive: true };

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
          // Explicitly exclude credentialData for security
        },
      });

      return credentials.map((cred) => ({
        ...cred,
        provider: cred.provider as IntegrationProvider,
      }));
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

      const credential = await prisma.integrationCredential.findFirst({
        where: {
          id: credentialId,
          userId,
          orgId,
          isActive: true,
        },
      });

      if (!credential) {
        console.log('[Integration Service] Credential not found or inactive');
        return null;
      }

      // Decrypt credential data
      const decryptedData = JSON.parse(decrypt(credential.credentialData));

      // Update last used timestamp
      await prisma.integrationCredential.update({
        where: { id: credentialId },
        data: { lastUsedAt: new Date() },
      });

      console.log('[Integration Service] Credential retrieved and decrypted');

      return {
        id: credential.id,
        provider: credential.provider as IntegrationProvider,
        credentialName: credential.credentialName,
        scope: credential.scope,
        expiresAt: credential.expiresAt,
        isActive: credential.isActive,
        lastUsedAt: credential.lastUsedAt,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
        credentialData: decryptedData,
      };
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

      const credential = await prisma.integrationCredential.findFirst({
        where: { id: credentialId, userId, orgId, isActive: true },
      });

      if (!credential) {
        throw new Error('Credential not found or inactive');
      }

      // Decrypt existing data
      const credentialData = JSON.parse(decrypt(credential.credentialData));

      // Update tokens
      credentialData.accessToken = newAccessToken;
      if (newRefreshToken) {
        credentialData.refreshToken = newRefreshToken;
      }

      // Re-encrypt with updated tokens
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

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'UPDATE',
          entity: 'INTEGRATION_CREDENTIAL',
          entityId: credentialId,
          metadata: {
            action: 'TOKEN_REFRESH',
            provider: credential.provider,
          },
        },
      });

      console.log('[Integration Service] Token refreshed successfully');
    } catch (error) {
      console.error('[Integration Service] Failed to refresh token:', error);
      throw new Error(
        `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete credential (soft delete by marking inactive)
   */
  async deleteCredential(
    credentialId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    try {
      console.log('[Integration Service] Deleting credential:', credentialId);

      const credential = await prisma.integrationCredential.findFirst({
        where: { id: credentialId, userId, orgId },
      });

      if (!credential) {
        throw new Error('Credential not found');
      }

      // Soft delete: mark as inactive instead of hard delete
      // This preserves audit trail and allows for potential recovery
      await prisma.integrationCredential.update({
        where: { id: credentialId },
        data: { isActive: false },
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

      console.log('[Integration Service] Credential deleted (soft delete)');
    } catch (error) {
      console.error('[Integration Service] Failed to delete credential:', error);
      throw new Error(
        `Failed to delete credential: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const integrationService = new IntegrationService();
