import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ADHDFocusBooster({ energyLevel, symptomSeverity, onClose }) {
  const [completed, setCompleted] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const { data: booster, isLoading } = useQuery({
    queryKey: ['focus-booster', energyLevel, symptomSeverity],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateFocusBoosters', {
        energy_level: energyLevel,
        symptom_severity: symptomSeverity
      });
      return response.data?.booster;
    },
    enabled: energyLevel !== undefined && symptomSeverity !== undefined
  });

  // Timer logic
  React.useEffect(() => {
    if (!startTime || !booster) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, booster.duration_minutes * 60 - elapsed);

      if (remaining <= 0) {
        clearInterval(timer);
        setTimeRemaining(null);
      } else {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setTimeRemaining(`${mins}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, booster]);

  const handleStart = () => {
    setStartTime(new Date());
    setTimeRemaining(`${booster.duration_minutes}:00`);
  };

  const toggleActivity = (idx) => {
    setCompleted(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Card className="border-violet-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600">Finding perfect break for you...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!booster) return null;

  const bgGradient = booster.intensity === 'high'
    ? 'from-rose-50 to-orange-50'
    : booster.intensity === 'medium'
    ? 'from-amber-50 to-yellow-50'
    : 'from-emerald-50 to-teal-50';

  const borderColor = booster.intensity === 'high'
    ? 'border-rose-200'
    : booster.intensity === 'medium'
    ? 'border-amber-200'
    : 'border-emerald-200';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`bg-gradient-to-br ${bgGradient} border-2 ${borderColor} shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{booster.emoji}</span>
              <div>
                <CardTitle className="text-lg">{booster.title}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">{booster.explanation}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Timer */}
          {startTime && timeRemaining && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-white rounded-lg border-2 border-violet-300 text-center"
            >
              <p className="text-xs text-slate-600 mb-1">Time Remaining</p>
              <p className="text-4xl font-bold text-violet-600 font-mono">{timeRemaining}</p>
            </motion.div>
          )}

          {/* Activities */}
          <div className="space-y-2">
            {booster.activities?.map((activity, idx) => (
              <motion.button
                key={idx}
                onClick={() => toggleActivity(idx)}
                whileHover={{ scale: 1.02 }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  completed.includes(idx)
                    ? 'bg-white border-emerald-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    completed.includes(idx)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300'
                  }`}>
                    {completed.includes(idx) && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    completed.includes(idx) ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {activity}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Duration Info */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-700">
              <span className="font-semibold">{booster.duration_minutes} minutes</span> of {booster.type.replace('_', ' ')}
            </span>
          </div>

          {/* Start/End Buttons */}
          <div className="flex gap-2">
            {!startTime ? (
              <>
                <Button
                  onClick={handleStart}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Skip
                </Button>
              </>
            ) : (
              <>
                <Button
                  disabled={completed.length === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  ✨ Finished ({completed.length}/{booster.activities?.length})
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}