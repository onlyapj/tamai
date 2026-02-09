import React from 'react';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

export default function InsightsPanel({ tasks, moods, transactions, budgets, healthLogs, dateRange }) {
  const { start, end } = dateRange;
  
  const insights = [];

  // Task completion insight
  const recentTasks = tasks.filter(t => t.due_date >= start && t.due_date <= end);
  const completedTasks = recentTasks.filter(t => t.status === 'completed');
  const completionRate = recentTasks.length > 0 
    ? Math.round((completedTasks.length / recentTasks.length) * 100)
    : 0;

  const prevStart = format(subDays(parseISO(start), 30), 'yyyy-MM-dd');
  const prevTasks = tasks.filter(t => t.due_date >= prevStart && t.due_date < start);
  const prevCompletedTasks = prevTasks.filter(t => t.status === 'completed');
  const prevCompletionRate = prevTasks.length > 0
    ? Math.round((prevCompletedTasks.length / prevTasks.length) * 100)
    : 0;

  const taskImprovement = completionRate - prevCompletionRate;

  if (taskImprovement > 0) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      message: `Your task completion rate improved by ${taskImprovement}% this period! 🎉`
    });
  } else if (taskImprovement < -10) {
    insights.push({
      type: 'warning',
      icon: TrendingDown,
      message: `Task completion is down ${Math.abs(taskImprovement)}%. Consider reducing your workload.`
    });
  }

  // Mood insight
  const recentMoods = moods.filter(m => m.date >= start && m.date <= end);
  const avgMood = recentMoods.length > 0
    ? recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
    : 0;

  if (avgMood >= 8) {
    insights.push({
      type: 'success',
      icon: Award,
      message: `Your mood has been excellent (${avgMood.toFixed(1)}/10) - keep doing what you're doing!`
    });
  } else if (avgMood < 5 && recentMoods.length >= 3) {
    insights.push({
      type: 'info',
      icon: AlertCircle,
      message: `Your mood average is ${avgMood.toFixed(1)}/10. Remember to be gentle with yourself.`
    });
  }

  // Budget insight
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => {
    const spent = transactions
      .filter(t => t.category === b.category && t.type === 'expense' && t.date >= currentMonth + '-01')
      .reduce((s, t) => s + t.amount, 0);
    return sum + spent;
  }, 0);

  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (budgetUsage < 80 && totalBudget > 0) {
    insights.push({
      type: 'success',
      icon: Award,
      message: `You're at ${Math.round(budgetUsage)}% of your budget - great financial discipline!`
    });
  } else if (budgetUsage > 95) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      message: `You've used ${Math.round(budgetUsage)}% of your budget. Consider adjusting spending.`
    });
  }

  // Activity insight
  const recentHealthLogs = healthLogs.filter(h => h.date >= start && h.date <= end);
  const avgExercise = recentHealthLogs.length > 0
    ? recentHealthLogs.reduce((sum, h) => sum + (h.exercise_minutes || 0), 0) / recentHealthLogs.length
    : 0;

  if (avgExercise >= 30) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      message: `Averaging ${Math.round(avgExercise)} minutes of exercise daily - fantastic!`
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: AlertCircle,
      message: 'Keep logging your activities to unlock personalized insights!'
    });
  }

  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, i) => {
        const Icon = insight.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl border p-4 ${typeStyles[insight.type]}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColors[insight.type]}`} />
              <p className="text-sm font-medium">{insight.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}