import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

interface ApiError {
  status: 'error';
  message: string;
  errors?: any[];
}

interface UseApiOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { enabled = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching data from: ${endpoint}`);
      
      // Use axios instance which includes JWT token
      const response = await api.get(endpoint);
      console.log(`API response for ${endpoint}:`, response.data);

      // Extract the actual data from the response
      // Handle both direct data and nested data structures
      const responseData = response.data?.data || response.data;
      
      setData(responseData);
      setError(null);
      onSuccess?.(responseData);
    } catch (err: any) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      const apiError: ApiError = {
        status: 'error',
        message: err.response?.data?.message || err.message || 'An error occurred'
      };
      setError(apiError);
      setData(null);
      onError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, enabled, onSuccess, onError]);

  useEffect(() => {
    let isMounted = true;

    const fetchDataWithMountCheck = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching data from: ${endpoint}`);
        
        // Use axios instance which includes JWT token
        const response = await api.get(endpoint);
        console.log(`API response for ${endpoint}:`, response.data);

        if (isMounted) {
          // Extract the actual data from the response
          // Handle both direct data and nested data structures
          const responseData = response.data?.data || response.data;
          
          setData(responseData);
          setError(null);
          onSuccess?.(responseData);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Error fetching data from ${endpoint}:`, err);
          const apiError: ApiError = {
            status: 'error',
            message: err.response?.data?.message || err.message || 'An error occurred'
          };
          setError(apiError);
          setData(null);
          onError?.(apiError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDataWithMountCheck();

    return () => {
      isMounted = false;
    };
  }, [endpoint, enabled, onSuccess, onError]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}

export function useApiMutation<T, D = any>(
  endpoint: string | ((param?: any) => string),
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { onSuccess, onError, method: defaultMethod = 'POST' } = options;

  const mutate = async (payload: D, param?: any, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = defaultMethod) => {
    try {
      setIsLoading(true);
      // Determine the endpoint
      const finalEndpoint = typeof endpoint === 'function' ? endpoint(param) : endpoint;
      
      let response;
      switch (method) {
        case 'POST':
          response = await api.post(finalEndpoint, payload);
          break;
        case 'PUT':
          response = await api.put(finalEndpoint, payload);
          break;
        case 'PATCH':
          response = await api.patch(finalEndpoint, payload);
          break;
        case 'DELETE':
          response = await api.delete(finalEndpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Extract the actual data from the response
      // Handle both direct data and nested data structures
      const responseData = response.data?.data || response.data;

      setData(responseData);
      setError(null);
      onSuccess?.(responseData);
      return responseData;
    } catch (err: any) {
      const apiError: ApiError = {
        status: 'error',
        message: err.response?.data?.message || err.message || 'An error occurred'
      };
      setError(apiError);
      setData(null);
      onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, error, isLoading };
} 