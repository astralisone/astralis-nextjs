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
 * - Encryption key derived from ASTRALIS_ENCRYPTION_KEY or NEXTAUTH_SECRET
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
  status: string;
  lastError: string | null;
  errorCount: number;
  lastErrorAt: Date | null;
  lastHealthCheck: Date | null;
  healthCheckInterval: number;
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
      console.log(`[Integration Service] saveCredential called: ${data.provider} for user ${userId}, org ${orgId}`);

      // Validate inputs
      console.log('[Integration Service] Validating inputs:', { userId, orgId, provider: data.provider, credentialName: data.credentialName });
      if (!userId || !orgId) {
        throw new Error(`Invalid userId or orgId: userId=${userId}, orgId=${orgId}`);
      }

      if (!data.provider || !data.credentialName) {
        throw new Error(`Invalid provider or credentialName: provider=${data.provider}, credentialName=${data.credentialName}`);
      }
      console.log('[Integration Service] Input validation passed');

      // 1. Encrypt credential data
      console.log('[Integration Service] About to encrypt credential data...');
      const encryptedData = encrypt(JSON.stringify(data.credentialData));
      console.log('[Integration Service] Credential data encrypted successfully, length:', encryptedData.length);

      // 2. Save to database
      console.log(`[Integration Service] Creating database record for ${data.provider}`);

      console.log('[Integration Service] About to create database record...');
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
          status: 'CONNECTED_ACTIVE',
        },
      });

      console.log('[Integration Service] Database record created successfully:', credential.id);
      console.log('[Integration Service] Created credential details:', {
        id: credential.id,
        provider: credential.provider,
        userId: credential.userId,
        orgId: credential.orgId,
        isActive: credential.isActive,
        status: credential.status
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
         status: credential.status,
         lastError: credential.lastError,
         errorCount: credential.errorCount,
         lastErrorAt: credential.lastErrorAt,
         lastHealthCheck: credential.lastHealthCheck,
         healthCheckInterval: credential.healthCheckInterval,
         lastUsedAt: credential.lastUsedAt,
         createdAt: credential.createdAt,
         updatedAt: credential.updatedAt,
       };
    } catch (error) {
      console.error('[Integration Service] Failed to save credential:', error);

      // Provide more specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Encryption key not found')) {
          throw new Error('Server configuration error: Encryption keys are not configured. Please contact support.');
        } else if (error.message.includes('Failed to encrypt data')) {
          throw new Error('Server encryption error: Unable to secure credential data. Please contact support.');
        } else if (error.message.includes('unique constraint')) {
          throw new Error(`A credential with the name "${data.credentialName}" already exists for this provider.`);
        }
      }

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
          status: true,
          lastError: true,
          errorCount: true,
          lastErrorAt: true,
          lastHealthCheck: true,
          healthCheckInterval: true,
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
      console.error('[Integration Service] Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Update integration status
   */
  async updateStatus(
    credentialId: string,
    userId: string,
    orgId: string,
    status: string,
    error?: string
  ): Promise<void> {
    try {
      console.log('[Integration Service] Updating status for credential:', credentialId, 'to:', status);

      const updateData: any = {
        status,
        lastUsedAt: new Date(),
      };

      if (error) {
        updateData.lastError = error;
        updateData.lastErrorAt = new Date();
        updateData.errorCount = {
          increment: 1,
        };
      } else if (status === 'CONNECTED_ACTIVE') {
        // Clear errors on successful connection
        updateData.lastError = null;
        updateData.errorCount = 0;
      }

      await prisma.integrationCredential.update({
        where: { id: credentialId, userId, orgId },
        data: updateData,
      });

      // Log status change
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'UPDATE',
          entity: 'INTEGRATION_CREDENTIAL',
          entityId: credentialId,
          metadata: {
            action: 'STATUS_CHANGE',
            newStatus: status,
            error: error || null,
          },
        },
      });

    } catch (error) {
      console.error('[Integration Service] Status update failed:', error);
      throw error;
    }
  }

  /**
   * Mark integration as needing re-authentication
   */
  async markNeedsReauth(
    credentialId: string,
    userId: string,
    orgId: string,
    reason: string
  ): Promise<void> {
    await this.updateStatus(credentialId, userId, orgId, 'NEEDS_REAUTH', reason);
  }

  /**
   * Mark integration as having an error
   */
  async markError(
    credentialId: string,
    userId: string,
    orgId: string,
    error: string
  ): Promise<void> {
    await this.updateStatus(credentialId, userId, orgId, 'CONNECTED_ERROR', error);
  }

  /**
   * Mark integration as active/healthy
   */
  async markActive(
    credentialId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    await this.updateStatus(credentialId, userId, orgId, 'CONNECTED_ACTIVE');
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
