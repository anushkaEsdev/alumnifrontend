import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export const ConnectionTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/test');
        setStatus('success');
        setMessage(response.data.message);
        setTimestamp(response.data.timestamp);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to connect to backend');
        console.error('Connection test error:', error);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Connection Test</h2>
      <div className="space-y-2">
        <p>
          Status:{' '}
          <span className={`font-semibold ${
            status === 'success' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {status.toUpperCase()}
          </span>
        </p>
        <p>Message: {message}</p>
        {timestamp && <p>Timestamp: {new Date(timestamp).toLocaleString()}</p>}
      </div>
    </div>
  );
}; 