import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ADHD profile
    const profiles = await base44.asServiceRole.entities.ADHDProfile.list();
    const adhdProfile = profiles.find(p => p.created_by === user.email);

    if (!adhdProfile?.has_adhd) {
      return Response.json({
        message: 'Enable ADHD mode in your profile to get ADHD-specific insights',
        patterns: null,
        recommendations: []
      });
    }

    // Fetch ADHD logs and other data
    const [adhdLogs, habits, habitLogs, moodEntries, tasks] = await Promise.all([
      base44.asServiceRole.entities.ADHDLog.list('-date', 90),
      base44.entities.Habit.list(),
      base44.entities.HabitLog.list('-date', 90),
      base44.entities.MoodEntry.list('-date', 30),
      base44.entities.Task.list('-due_date')
    ]);

    if (adhdLogs.length < 5) {
      return Response.json({
        message: 'Log more ADHD patterns to unlock personalized insights (need 5+ days)',
        patterns: null,
        recommendations: []
      });
    }

    // Analyze focus windows
    const focusWindowsByTime = {};
    const focusSessionsByHour = {};
    const energyCrashTimes = [];

    adhdLogs.forEach(log => {
      if (log.focus_sessions) {
        log.focus_sessions.forEach(session => {
          const hour = parseInt(session.start_time.split(':')[0]);
          focusSessionsByHour[hour] = (focusSessionsByHour[hour] || 0) + 1;
          
          if (!focusWindowsByTime[session.duration_minutes]) {
            focusWindowsByTime[session.duration_minutes] = 0;
          }
          focusWindowsByTime[session.duration_minutes]++;
        });
      }

      if (log.energy_crashes) {
        log.energy_crashes.forEach(crash => {
          energyCrashTimes.push(crash.time);
        });
      }
    });

    // Find best focus times
    const bestFocusHours = Object.entries(focusSessionsByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => {
        const h = parseInt(hour);
        const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
        return { hour: h, period, sessionCount: count };
      });

    // Average focus window
    const avgFocusMinutes = Object.keys(focusWindowsByTime).length > 0
      ? Math.round(
          Object.entries(focusWindowsByTime).reduce((sum, [mins, count]) => sum + (parseInt(mins) * count), 0) /
          Object.values(focusWindowsByTime).reduce((s, c) => s + c, 0)
        )
      : 30;

    // Hyperfocus pattern detection
    const hyperfocusSessions = adhdLogs
      .flatMap(log => log.focus_sessions?.filter(s => s.was_hyperfocus) || [])
      .length;

    const hyperfocusTriggers = {};
    adhdLogs.forEach(log => {
      if (log.focus_sessions) {
        log.focus_sessions
          .filter(s => s.was_hyperfocus)
          .forEach(s => {
            hyperfocusTriggers[s.task] = (hyperfocusTriggers[s.task] || 0) + 1;
          });
      }
    });

    const topHyperfocusTriggers = Object.entries(hyperfocusTriggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([task]) => task);

    // Energy analysis
    const recentLogs = adhdLogs.slice(0, 14);
    const avgSymptomSeverity = (recentLogs.reduce((s, l) => s + (l.symptom_severity || 5), 0) / recentLogs.length).toFixed(1);
    const avgEnergyLevel = (recentLogs.reduce((s, l) => s + (l.energy_level || 5), 0) / recentLogs.length).toFixed(1);
    const avgFocusScore = (recentLogs.reduce((s, l) => s + (l.focus_score || 5), 0) / recentLogs.length).toFixed(1);

    // Medication impact
    let medicationImpact = 0;
    let medicatedDays = 0;
    if (adhdProfile.is_medicated) {
      recentLogs.forEach(log => {
        if (log.medication_taken) {
          medicatedDays++;
          medicationImpact += log.focus_score || 5;
        }
      });
      medicationImpact = medicatedDays > 0 ? (medicationImpact / medicatedDays).toFixed(1) : 0;
    }

    // Sleep correlation
    const wellSleptDays = recentLogs.filter(l => (l.sleep_hours || 0) >= 7).length;
    const sleepFocusCorr = recentLogs.filter(l => (l.sleep_hours || 0) >= 7)
      .reduce((sum, l) => sum + (l.focus_score || 5), 0) / (wellSleptDays || 1);

    // Generate AI recommendations
    const prompt = `You are an ADHD-aware productivity coach. Based on this user's ADHD data patterns, provide personalized strategies:

User ADHD Profile:
- Type: ${adhdProfile.adhd_type}
- Medicated: ${adhdProfile.is_medicated ? adhdProfile.medication_name : 'No'}
- Best focus time: ${bestFocusHours[0]?.period || 'variable'}
- Average focus window: ${avgFocusMinutes} minutes
- Current symptom severity: ${avgSymptomSeverity}/10
- Current energy level: ${avgEnergyLevel}/10
- Focus score: ${avgFocusScore}/10

Observed Patterns:
- Best focus hours: ${bestFocusHours.map(h => `${h.hour}:00 (${h.period})`).join(', ')}
- Hyperfocus sessions: ${hyperfocusSessions} detected
- Top hyperfocus triggers: ${topHyperfocusTriggers.join(', ') || 'varied'}
- Energy crashes: ${energyCrashTimes.length} recorded
- Sleep correlation: ${wellSleptDays}+ days with 7+ hours sleep
- Medication impact: ${medicationImpact || 'not tracked'}

Provide JSON with:
1. "focusStrategy": Best times and duration for deep work based on their patterns
2. "energyTips": 2-3 tips to manage energy crashes and symptom severity
3. "hyperfocusGuide": How to harness hyperfocus for important tasks
4. "routineOptimization": Daily routine recommendations (medication timing, breaks, etc.)
5. "habitAdjustments": How to adjust habits for ADHD (shorter goals, frequent wins, etc.)
6. "warningSignsAndRecovery": Signs of overwhelm and recovery strategies

Be practical, ADHD-aware, and avoid judgment. Acknowledge executive function challenges.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          focusStrategy: { type: 'string' },
          energyTips: { type: 'array', items: { type: 'string' } },
          hyperfocusGuide: { type: 'string' },
          routineOptimization: { type: 'string' },
          habitAdjustments: { type: 'string' },
          warningSignsAndRecovery: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      profile: {
        adhd_type: adhdProfile.adhd_type,
        is_medicated: adhdProfile.is_medicated,
        medication: adhdProfile.medication_name,
        has_profile: true
      },
      patterns: {
        bestFocusHours,
        avgFocusWindowMinutes: avgFocusMinutes,
        hyperfocusSessions,
        topHyperfocusTriggers,
        energyCrashTimes: energyCrashTimes.slice(0, 5),
        avgSymptomSeverity,
        avgEnergyLevel,
        avgFocusScore,
        medicationImpact: adhdProfile.is_medicated ? medicationImpact : null,
        sleepCorrelation: sleepFocusCorr.toFixed(1)
      },
      recommendations: {
        focusStrategy: aiResponse.focusStrategy,
        energyTips: aiResponse.energyTips || [],
        hyperfocusGuide: aiResponse.hyperfocusGuide,
        routineOptimization: aiResponse.routineOptimization,
        habitAdjustments: aiResponse.habitAdjustments,
        warningSignsAndRecovery: aiResponse.warningSignsAndRecovery
      },
      recentDaysLogged: recentLogs.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});