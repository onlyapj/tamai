import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackWidget({ conversationId }) {
  const [showComment, setShowComment] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitFeedback = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      setTimeout(() => {
        setShowComment(false);
        setComment('');
        setSelectedRating(null);
        setSubmitted(false);
      }, 2000);
    }
  });

  const handleRating = (rating) => {
    setSelectedRating(rating);
    setShowComment(true);
  };

  const handleSubmit = () => {
    submitFeedback.mutate({
      conversation_id: conversationId,
      rating: selectedRating,
      comment: comment.trim() || undefined
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-emerald-600 py-3"
      >
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">Feedback submitted!</span>
      </motion.div>
    );
  }

  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500 mb-3">How was this conversation?</p>
      
      <div className="flex gap-2 mb-3">
        <Button
          variant={selectedRating === 'positive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRating('positive')}
          className={selectedRating === 'positive' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Helpful
        </Button>
        <Button
          variant={selectedRating === 'negative' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRating('negative')}
          className={selectedRating === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Not helpful
        </Button>
      </div>

      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Textarea
              placeholder="Tell us more about your experience (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-sm h-20 resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitFeedback.isPending}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-3 w-3 mr-2" />
                Submit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowComment(false);
                  setSelectedRating(null);
                  setComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}