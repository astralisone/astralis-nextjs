/**
 * GitHub Integration Service
 *
 *
 */
import {
  BaseIntegrationService,
  type OAuthCredentialData,
} from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';

export interface GitHubCredentialData extends OAuthCredentialData {
  // GitHub-specific fields can be added here
}

export class GitHubService extends BaseIntegrationService<GitHubCredentialData> {
  constructor() {
    super({
      provider: 'GITHUB',
      baseUrl: 'https://api.github.com',
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getAccountInfo();
      return response.success;
    } catch (error) {
      console.error('[GitHub] Test connection failed:', error);
      return false;
    }
  }

  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.apiRequest('/user');
  }

  // Add other GitHub-specific methods here, for example:
  // async listRepos(): Promise<IntegrationApiResponse<any[]>> {
  //   return this.apiRequest('/user/repos');
  // }
  //
  // async createIssue(owner: string, repo: string, title: string, body: string): Promise<IntegrationApiResponse<any>> {
  //   return this.apiRequest(`/repos/${owner}/${repo}/issues`, {
  //     method: 'POST',
  //     body: { title, body },
  //   });
  // }
}

export const githubService = new GitHubService();
