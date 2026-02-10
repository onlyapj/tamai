import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrueLayerCallback() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          setStatus('error');
          setTimeout(() => window.location.href = createPageUrl('Finance'), 2000);
          return;
        }

        await base44.functions.invoke('connectTrueLayer', { 
          action: 'exchange', 
          code 
        });

        setStatus('success');
        setTimeout(() => window.location.href = createPageUrl('Finance'), 1500);
      } catch (error) {
        setStatus('error');
        setTimeout(() => window.location.href = createPageUrl('Finance'), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connecting your bank...</h2>
            <p className="text-slate-500">Please wait while we set up your connection</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connected!</h2>
            <p className="text-slate-500">Redirecting you back...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connection failed</h2>
            <p className="text-slate-500">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
}