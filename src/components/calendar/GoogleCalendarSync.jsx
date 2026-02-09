import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, RefreshCw, Download, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, Unlink } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleCalendarSync({ onSyncComplete }) {
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user to check sync settings
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Load sync settings on mount
  useEffect(() => {
    if (user?.google_calendar_sync?.enabled) {
      setIsConnected(true);
      setSelectedCalendars(user.google_calendar_sync.selected_calendars || []);
      refetchCalendars();
    }
  }, [user]);

  // Fetch available Google Calendars
  const { data: calendarsData, refetch: refetchCalendars } = useQuery({
    queryKey: ['google-calendars'],
    queryFn: async () => {
      const response = await base44.functions.invoke('syncGoogleCalendar', { action: 'list_calendars' });
      setIsConnected(true);
      return response.data.calendars || [];
    },
    enabled: false,
    retry: false
  });

  const connectGoogle = async () => {
    setIsConnecting(true);
    try {
      await refetchCalendars();
      toast.success('Connected to Google Calendar');
    } catch (error) {
      // OAuth required - show error and provide authorization link
      toast.error('Please authorize Google Calendar access in your app settings');
      window.open('/dashboard/settings', '_blank');
    } finally {
      setIsConnecting(false);
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('syncGoogleCalendar', {
        action: 'import_events',
        calendarIds: selectedCalendars
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // Save sync settings
      await base44.auth.updateMe({
        google_calendar_sync: {
          enabled: true,
          selected_calendars: selectedCalendars
        }
      });
      queryClient.invalidateQueries(['current-user']);
      toast.success(`Imported ${data.imported} events from Google Calendar`);
      onSyncComplete?.();
    },
    onError: () => {
      toast.error('Failed to import events');
    }
  });

  const unsyncMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        google_calendar_sync: {
          enabled: false,
          selected_calendars: []
        }
      });
    },
    onSuccess: () => {
      setIsConnected(false);
      setSelectedCalendars([]);
      queryClient.invalidateQueries(['current-user']);
      toast.success('Google Calendar disconnected');
    }
  });

  const toggleCalendar = (calendarId) => {
    setSelectedCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Google Calendar Sync</h3>
          <p className="text-xs text-slate-500">Import and sync with your Google calendars</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-6">
          <LinkIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">Connect your Google Calendar to sync events</p>
          <Button
            onClick={connectGoogle}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Connected to Google Calendar
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => unsyncMutation.mutate()}
              disabled={unsyncMutation.isPending}
              className="h-7 text-slate-600 hover:text-red-600"
            >
              <Unlink className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Select calendars to sync:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {calendarsData?.map((calendar) => (
                <label
                  key={calendar.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedCalendars.includes(calendar.id)}
                    onCheckedChange={() => toggleCalendar(calendar.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {calendar.summary}
                    </p>
                    {calendar.description && (
                      <p className="text-xs text-slate-500 truncate">{calendar.description}</p>
                    )}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => importMutation.mutate()}
              disabled={selectedCalendars.length === 0 || importMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {importMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Import Events
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            New events created in TAMAI will automatically sync to your selected Google calendars
          </p>
        </div>
      )}
    </div>
  );
}