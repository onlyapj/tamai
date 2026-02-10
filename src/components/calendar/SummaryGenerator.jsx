import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Sparkles, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SummaryGenerator({ task, onClose, onSummaryGenerated }) {
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateMeetingSummary', data);
      return response.data;
    },
    onSuccess: (result) => {
      toast.success('Meeting summary generated!');
      onSummaryGenerated(result);
      setNotes('');
      setAttendees('');
    },
    onError: () => {
      toast.error('Failed to generate summary');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Extract text from file if it's a transcript
      const { output } = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' }
          }
        }
      });

      if (output?.content) {
        setNotes(output.content);
        toast.success('Transcript uploaded');
      }
    } catch (error) {
      toast.error('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = () => {
    if (!notes.trim()) {
      toast.error('Please provide meeting notes or a transcript');
      return;
    }

    generateMutation.mutate({
      task_id: task.id,
      meeting_title: task.title,
      meeting_date: task.due_date,
      notes,
      attendees: attendees.split(',').map(a => a.trim()).filter(Boolean)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Generate Meeting Summary
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Meeting Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700">📌 {task.title}</p>
            <p className="text-xs text-slate-500 mt-1">{task.due_date} {task.scheduled_time && `at ${task.scheduled_time}`}</p>
          </div>

          {/* File Upload */}
          <div>
            <Label className="block mb-2">Upload Transcript or Notes (Optional)</Label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <Upload className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                {isUploading ? 'Processing...' : 'Click to upload PDF, TXT, or audio transcript'}
              </span>
              <input 
                type="file" 
                hidden 
                accept=".pdf,.txt,.md,.docx,.wav,.mp3"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Meeting Notes */}
          <div>
            <Label htmlFor="notes">Meeting Notes *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste meeting transcript, notes, or discussion points here..."
              rows={6}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              AI will extract key decisions, action items, and discussion points
            </p>
          </div>

          {/* Attendees */}
          <div>
            <Label htmlFor="attendees">Attendees (Optional)</Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="John Doe, Jane Smith, Bob Johnson (comma separated)"
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={generateMutation.isPending || !notes.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}