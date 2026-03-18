import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate as admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all recurring transactions
    const allTransactions = await base44.asServiceRole.entities.Transaction.filter({ recurring: true });
    
    const today = new Date().toISOString().split('T')[0];
    const processedCount = { created: 0, updated: 0 };
    
    for (const transaction of allTransactions) {
      // Skip if no next occurrence or if it's in the future
      if (!transaction.next_occurrence || transaction.next_occurrence > today) {
        continue;
      }
      
      // Calculate next occurrence date
      const calculateNextDate = (currentDate, pattern) => {
        const date = new Date(currentDate);
        switch (pattern) {
          case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
          case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
          case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
          case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
          case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        }
        return date.toISOString().split('T')[0];
      };
      
      // Create new transaction instance
      await base44.asServiceRole.entities.Transaction.create({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        sub_category: transaction.sub_category,
        description: transaction.description,
        date: transaction.next_occurrence,
        recurring: false, // Instance is not recurring
        created_by: transaction.created_by
      });
      processedCount.created++;
      
      // Update the template with new next occurrence
      const nextDate = calculateNextDate(transaction.next_occurrence, transaction.recurring_pattern);
      await base44.asServiceRole.entities.Transaction.update(transaction.id, {
        next_occurrence: nextDate
      });
      processedCount.updated++;
    }
    
    return Response.json({
      success: true,
      message: `Processed ${processedCount.created} recurring transactions`,
      details: processedCount
    });
    
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});