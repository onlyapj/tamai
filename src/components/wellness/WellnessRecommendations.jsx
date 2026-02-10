import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Lightbulb, ArrowRight, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PRIORITY_COLORS = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-blue-200 bg-blue-50'
};

const PRIORITY_ICONS = {
  high: <AlertCircle className="h-5 w-5 text-red-600" />,
  medium: <Lightbulb className="h-5 w-5 text-amber-600" />,
  low: <Lightbulb className="h-5 w-5 text-blue-600" />
};

export default function WellnessRecommendations() {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['wellness-recommendations'],
    queryFn: () => base44.entities.WellnessRecommendation.filter({ dismissed: false }, '-priority', 10)
  });

  const generateMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateWellnessRecommendations'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-recommendations'] });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.WellnessRecommendation.update(id, { dismissed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-recommendations'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 text-center">
            <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">No recommendations yet. Generate some based on your wellness data!</p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">AI Wellness Recommendations</h3>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              variant="outline"
              size="sm"
            >
              {generateMutation.isPending ? 'Generating...' : 'Refresh'}
            </Button>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-2 ${PRIORITY_COLORS[rec.priority]}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {PRIORITY_ICONS[rec.priority]}
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissMutation.mutate(rec.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-3">{rec.description}</p>
                    
                    {rec.action_items?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Action Steps:</p>
                        <ul className="space-y-1">
                          {rec.action_items.map((item, i) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-600">
                              <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}