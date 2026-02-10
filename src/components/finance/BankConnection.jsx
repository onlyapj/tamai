import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BankConnection() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const connectBank = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('connectTrueLayer', { action: 'init' });
      window.location.href = data.authUrl;
    }
  });

  const syncTransactions = useMutation({
    mutationFn: async () => {
      setSyncing(true);
      const { data } = await base44.functions.invoke('syncBankTransactions', {});
      return data;
    },
    onSuccess: (data) => {
      setSyncing(false);
      toast.success(`Imported ${data.imported} new transactions from ${data.accounts} account(s)`);
      queryClient.invalidateQueries(['transactions']);
    },
    onError: (error) => {
      setSyncing(false);
      toast.error('Failed to sync transactions');
    }
  });

  const isConnected = user?.bank_connected;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 rounded-2xl p-3">
            <Building2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Bank Connection</h3>
            <p className="text-sm text-slate-500">
              {isConnected 
                ? 'Your bank is connected. Sync to import new transactions.'
                : 'Connect your UK bank account to automatically import transactions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
              <Button
                onClick={() => syncTransactions.mutate()}
                disabled={syncing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => connectBank.mutate()}
              disabled={connectBank.isPending}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Connect Bank
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}