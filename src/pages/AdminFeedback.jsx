import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminFeedback() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === 'all') {
        return base44.entities.Feedback.list('-created_date');
      }
      return base44.entities.Feedback.filter({ status: selectedStatus }, '-created_date');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Feedback.update(id, data),
    onSuccess: async (_, { id, data }) => {
      queryClient.invalidateQueries(['feedback']);
      setEditingId(null);
      setAdminNotes('');
      toast.success('Feedback updated');
      
      // If status changed to reviewed or resolved, notify the user
      if ((data.status === 'reviewed' || data.status === 'resolved') && data.admin_notes) {
        const feedbackItem = feedback.find(f => f.id === id);
        if (feedbackItem) {
          await base44.functions.invoke('sendNotification', {
            recipient_email: feedbackItem.created_by,
            type: 'success',
            category: 'feedback',
            title: 'Your Feedback Was Reviewed',
            message: `Thank you for your feedback. An admin has responded.`,
            action_url: '/Home'
          });
        }
      }
    }
  });

  const handleStatusChange = (feedbackId, newStatus) => {
    updateMutation.mutate({
      id: feedbackId,
      data: { status: newStatus }
    });
  };

  const handleSaveNotes = (feedbackId) => {
    updateMutation.mutate({
      id: feedbackId,
      data: { admin_notes: adminNotes }
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    reviewed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    resolved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">User Feedback</h1>
          <p className="text-slate-600">Review and manage feedback from TAMAI conversations</p>
        </div>

        <div className="mb-6 flex gap-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => {
              const StatusIcon = statusConfig[item.status].icon;
              const isEditing = editingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {item.rating === 'positive' ? (
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <ThumbsUp className="h-5 w-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                          <ThumbsDown className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">{item.created_by}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(item.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig[item.status].bg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig[item.status].color}`} />
                      <span className={`text-xs font-medium ${statusConfig[item.status].color} capitalize`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {item.comment && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-slate-700">{item.comment}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add admin notes..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="h-24"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveNotes(item.id)}
                            disabled={updateMutation.isPending}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Save Notes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setAdminNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.admin_notes && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <p className="text-xs text-blue-600 font-medium mb-1">Admin Notes:</p>
                            <p className="text-sm text-slate-700">{item.admin_notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(item.id);
                              setAdminNotes(item.admin_notes || '');
                            }}
                          >
                            {item.admin_notes ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                          <Select
                            value={item.status}
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}