import { base44 } from '@/api/base44Client';

export default async function syncGoogleCalendar({ action, calendarIds, taskId, taskData }) {
  // Get Google Calendar access token
  const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
  
  if (action === 'list_calendars') {
    // Fetch user's Google Calendars
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return { calendars: data.items };
  }
  
  if (action === 'import_events') {
    // Import events from selected Google Calendars
    const allEvents = [];
    
    for (const calendarId of calendarIds) {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${new Date().toISOString()}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      
      if (data.items) {
        for (const event of data.items) {
          // Check if event already exists
          const existing = await base44.entities.Task.filter({ 
            google_event_id: event.id 
          });
          
          if (existing.length === 0) {
            // Create new task from Google event
            await base44.entities.Task.create({
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              due_date: event.start?.date || event.start?.dateTime?.split('T')[0],
              scheduled_time: event.start?.dateTime ? new Date(event.start.dateTime).toTimeString().slice(0, 5) : null,
              duration_minutes: event.end && event.start ? 
                Math.round((new Date(event.end.dateTime || event.end.date) - new Date(event.start.dateTime || event.start.date)) / 60000) : 30,
              google_event_id: event.id,
              google_calendar_id: calendarId,
              list_name: 'Google Calendar',
              priority: 'medium',
              status: 'pending'
            });
            allEvents.push(event);
          }
        }
      }
    }
    
    return { imported: allEvents.length };
  }
  
  if (action === 'export_event') {
    // Export TAMAI task to Google Calendar
    const calendarId = calendarIds[0]; // Use first calendar as default
    
    const eventBody = {
      summary: taskData.title,
      description: taskData.description || '',
      start: taskData.scheduled_time ? {
        dateTime: `${taskData.due_date}T${taskData.scheduled_time}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : {
        date: taskData.due_date
      },
      end: taskData.scheduled_time && taskData.duration_minutes ? {
        dateTime: new Date(new Date(`${taskData.due_date}T${taskData.scheduled_time}:00`).getTime() + taskData.duration_minutes * 60000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : {
        date: taskData.due_date
      },
      reminders: taskData.reminder_minutes ? {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: taskData.reminder_minutes }]
      } : { useDefault: true }
    };
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }
    );
    
    const createdEvent = await response.json();
    
    // Update task with Google event ID
    if (taskId) {
      await base44.entities.Task.update(taskId, {
        google_event_id: createdEvent.id,
        google_calendar_id: calendarId
      });
    }
    
    return { success: true, eventId: createdEvent.id };
  }
  
  return { error: 'Invalid action' };
}