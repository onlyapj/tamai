import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeframe = 'quarterly' } = await req.json();

    // Fetch habits and logs
    const habits = await base44.entities.Habit.list();
    const allLogs = await base44.entities.HabitLog.list('-date');

    // Calculate date ranges
    const now = new Date();
    let daysBack = 90; // quarterly
    let periods = [];

    if (timeframe === 'weekly') {
      daysBack = 56;
      for (let i = 0; i < 8; i++) {
        const start = new Date(now);
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        periods.unshift({ start, end, label: `Week ${8 - i}` });
      }
    } else if (timeframe === 'monthly') {
      daysBack = 180;
      for (let i = 0; i < 6; i++) {
        const start = new Date(now);
        start.setMonth(start.getMonth() - i - 1);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        periods.unshift({ start, end, label: start.toLocaleDateString('en-US', { month: 'short' }) });
      }
    } else if (timeframe === 'quarterly') {
      daysBack = 365;
      for (let i = 0; i < 4; i++) {
        const start = new Date(now);
        start.setMonth(Math.floor(start.getMonth() / 3) * 3 - i * 3);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 3);
        end.setDate(0);
        const q = Math.floor(start.getMonth() / 3) + 1;
        periods.unshift({ start, end, label: `Q${q} ${start.getFullYear()}` });
      }
    } else if (timeframe === 'yearly') {
      daysBack = 1095;
      for (let i = 0; i < 3; i++) {
        const year = now.getFullYear() - i;
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        periods.unshift({ start, end, label: year.toString() });
      }
    }

    // Calculate completion rates per period
    const trends = periods.map(period => {
      const periodLogs = allLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= period.start && logDate <= period.end;
      });

      const habitTrends = habits.map(habit => {
        const habitLogs = periodLogs.filter(log => log.habit_id === habit.id);
        const completed = habitLogs.filter(log => log.completed).length;
        const total = habitLogs.length || 1;
        const completionRate = Math.round((completed / total) * 100);

        return {
          name: habit.name,
          id: habit.id,
          completion_rate: completionRate,
          logs_count: habitLogs.length
        };
      });

      return {
        period: period.label,
        habits: habitTrends.filter(h => h.logs_count > 0)
      };
    });

    return Response.json({ trends, timeframe });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});