import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Trash2, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function MeetingSummaryPanel({ taskId, onGenerateClick }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: summaries = [] } = useQuery({
    queryKey: ['meeting-summaries', taskId],
    queryFn: () => base44.entities.MeetingSummary.filter({ task_id: taskId })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MeetingSummary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting-summaries', taskId]);
      toast.success('Summary deleted');
    }
  });

  const summary = summaries[0]; // Latest summary

  if (!summary) {
    return (
      <Button 
        onClick={onGenerateClick}
        variant="outline"
        className="w-full gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI Summary
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-all text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">AI Meeting Summary</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Generated {format(parseISO(summary.generated_at), 'MMM d, h:mm a')}
            </p>
          </div>
          <ChevronDown className={`h-4 w-4 text-amber-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Summary */}
              {summary.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{summary.summary}</p>
                </div>
              )}

              {/* Key Decisions */}
              {summary.key_decisions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">🎯 Key Decisions</h4>
                  <ul className="space-y-1">
                    {summary.key_decisions.map((decision, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Discussion Points */}
              {summary.discussion_points?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">💬 Discussion Points</h4>
                  <ul className="space-y-1">
                    {summary.discussion_points.map((point, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {summary.action_items?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">✅ Action Items</h4>
                  <ul className="space-y-2">
                    {summary.action_items.map((item, i) => (
                      <li key={i} className="text-sm bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-700 font-medium">{item.action}</p>
                        {item.owner && <p className="text-xs text-slate-500 mt-1">Owner: {item.owner}</p>}
                        {item.due_date && <p className="text-xs text-slate-500">Due: {format(parseISO(item.due_date), 'MMM d')}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Attendees */}
              {summary.attendees?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">👥 Attendees</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.attendees.map((attendee, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const text = `${summary.summary}\n\nKey Decisions:\n${summary.key_decisions?.join('\n')}\n\nAction Items:\n${summary.action_items?.map(a => `- ${a.action}${a.owner ? ` (${a.owner})` : ''}${a.due_date ? ` - Due: ${a.due_date}` : ''}`).join('\n')}`;
                    navigator.clipboard.writeText(text);
                    toast.success('Summary copied to clipboard');
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => deleteMutation.mutate(summary.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}