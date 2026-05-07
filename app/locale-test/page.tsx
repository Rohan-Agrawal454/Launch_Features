'use client';

import { useState, useEffect } from 'react';

interface ApiResponse {
  success: boolean;
  message: string;
  params: Record<string, string>;
  requestPath: string;
  fullUrl: string;
  timestamp: string;
  error?: string;
}

export default function LocaleTestPage() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocaleParams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = '/api/locale-params';
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching locale params:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchLocaleParams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Locale Test Page
          </h1>
          
          <p className="text-gray-600 mb-6">
            This page calls the API to retrieve query parameters. 
            The edge function should automatically add locale parameters based on your country.
          </p>

          <button
            onClick={fetchLocaleParams}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out mb-6"
          >
            {loading ? 'Loading...' : 'Fetch Locale Parameters'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {response && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800 mb-3">API Response</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-green-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                    response.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">Message:</span>
                  <span className="ml-2 text-green-600">{response.message}</span>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">Request Path:</span>
                  <span className="ml-2 text-green-600 break-all font-mono">{response.requestPath}</span>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">Full URL:</span>
                  <span className="ml-2 text-green-600 break-all text-sm">{response.fullUrl}</span>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">Timestamp:</span>
                  <span className="ml-2 text-green-600">{response.timestamp}</span>
                </div>
                
                <div>
                  <span className="font-medium text-green-700">Query Parameters:</span>
                  <div className="mt-2 bg-white border border-green-200 rounded p-3">
                    {Object.keys(response.params).length > 0 ? (
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(response.params, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No parameters found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. This page calls <code className="bg-blue-100 px-1 rounded">/api/locale-params</code></li>
              <li>2. The edge function intercepts the request at Cloudflare edge</li>
              <li>3. Based on your country, it adds locale parameters (IN → hindi, US → eng)</li>
              <li>4. The API returns all query parameters including the added locale</li>
              <li>5. Results are cached for better performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}