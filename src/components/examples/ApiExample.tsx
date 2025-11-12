'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Example component demonstrating API integration
 *
 * This component shows how to use the API client to make requests
 * to the Express backend through the Next.js API proxy.
 */
export default function ApiExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection to backend
      const response = await apiClient.get('/api/health');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/blog/posts?limit=5');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/marketplace/items?limit=5');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Test</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test API Connection
        </button>

        <button
          onClick={fetchBlogPosts}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          Fetch Blog Posts
        </button>

        <button
          onClick={fetchMarketplaceItems}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 ml-4"
        >
          Fetch Marketplace Items
        </button>
      </div>

      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          Loading...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && !loading && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <pre className="overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Button click triggers API call using apiClient</li>
          <li>Request goes to Next.js API proxy at /api/proxy/[...path]</li>
          <li>Proxy forwards request to Express backend at localhost:3000</li>
          <li>Backend processes request and returns response</li>
          <li>Response is displayed in the UI</li>
        </ol>
      </div>
    </div>
  );
}
