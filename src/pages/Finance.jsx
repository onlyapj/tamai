import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/db';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, TrendingUp, TrendingDown, Wallet, Loader2, ArrowUpRight, ArrowDownRight, ReceiptText,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const expenseCategories = [
  'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Subscriptions', 'Other',
];

const incomeCategories = [
  'Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other',
];

export default function Finance() {
  const { user } = useAuth();
  const isDark = user?.theme === 'dark';
  const queryClient = useQueryClient();
  const currency = user?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20ac' : currency === 'GBP' ? '\u00a3' : currency;
  const currentMonth = format(new Date(), 'yyyy-MM');

  const [txnOpen, setTxnOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [txnForm, setTxnForm] = useState({
    amount: '', type: 'expense', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [budgetForm, setBudgetForm] = useState({ category: '', monthly_limit: '' });

  // Transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.list('transactions', { orderBy: 'date', ascending: false, limit: 100 }),
  });

  // Budgets for current month
  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', currentMonth],
    queryFn: () => db.filter('budgets', { month: currentMonth }),
  });

  // Mutations
  const createTransaction = useMutation({
    mutationFn: (data) => db.create('transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added!');
      setTxnForm({ amount: '', type: 'expense', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
      setTxnOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const createBudget = useMutation({
    mutationFn: (data) => db.create('budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget set!');
      setBudgetForm({ category: '', monthly_limit: '' });
      setBudgetOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreateTxn = (e) => {
    e.preventDefault();
    if (!txnForm.amount || !txnForm.category) {
      toast.error('Please fill in amount and category.');
      return;
    }
    createTransaction.mutate({
      amount: Number(txnForm.amount),
      type: txnForm.type,
      category: txnForm.category,
      description: txnForm.description,
      date: txnForm.date,
    });
  };

  const handleCreateBudget = (e) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.monthly_limit) return;
    createBudget.mutate({
      category: budgetForm.category,
      monthly_limit: Number(budgetForm.monthly_limit),
      month: currentMonth,
    });
  };

  // Calculations
  const monthTxns = transactions.filter((t) => t.date?.startsWith(currentMonth));
  const monthIncome = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const monthNet = monthIncome - monthExpenses;

  // Filtered transactions
  const filteredTxns = filterType === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filterType);

  // Category breakdown for chart
  const categoryTotals = {};
  monthTxns
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    });
  const categoryChartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  // Budget progress
  const budgetProgress = budgets.map((b) => {
    const spent = monthTxns
      .filter((t) => t.type === 'expense' && t.category === b.category)
      .reduce((s, t) => s + Number(t.amount), 0);
    const pct = b.monthly_limit > 0 ? Math.min((spent / b.monthly_limit) * 100, 100) : 0;
    return { ...b, spent, pct };
  });

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Finance
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Track your income, expenses, and budgets
          </p>
        </div>
        <Dialog open={txnOpen} onOpenChange={setTxnOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
            <DialogHeader>
              <DialogTitle className={cn(isDark && 'text-white')}>New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTxn} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={txnForm.amount}
                    onChange={(e) => setTxnForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                    className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isDark && 'text-slate-300')}>Type</Label>
                  <Select value={txnForm.type} onValueChange={(v) => setTxnForm((p) => ({ ...p, type: v, category: '' }))}>
                    <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                      <SelectItem value="expense" className={cn(isDark && 'text-slate-200')}>Expense</SelectItem>
                      <SelectItem value="income" className={cn(isDark && 'text-slate-200')}>Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Category</Label>
                <Select value={txnForm.category} onValueChange={(v) => setTxnForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                    {(txnForm.type === 'expense' ? expenseCategories : incomeCategories).map((c) => (
                      <SelectItem key={c} value={c} className={cn(isDark && 'text-slate-200')}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={txnForm.description}
                  onChange={(e) => setTxnForm((p) => ({ ...p, description: e.target.value }))}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn(isDark && 'text-slate-300')}>Date</Label>
                <Input
                  type="date"
                  value={txnForm.date}
                  onChange={(e) => setTxnForm((p) => ({ ...p, date: e.target.value }))}
                  className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createTransaction.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {createTransaction.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', isDark ? 'bg-green-950' : 'bg-green-50')}>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Income</p>
                <p className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {currencySymbol}{monthIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', isDark ? 'bg-red-950' : 'bg-red-50')}>
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Expenses</p>
                <p className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {currencySymbol}{monthExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', isDark ? 'bg-indigo-950' : 'bg-indigo-50')}>
                {monthNet >= 0 ? <TrendingUp className="h-5 w-5 text-indigo-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
              <div>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Net</p>
                <p className={cn('text-xl font-bold', monthNet >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {monthNet >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(monthNet).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className={cn(isDark && 'bg-slate-800')}>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                Recent Transactions
              </CardTitle>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className={cn('w-32', isDark && 'bg-slate-800 border-slate-700 text-white')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                  <SelectItem value="all" className={cn(isDark && 'text-slate-200')}>All</SelectItem>
                  <SelectItem value="income" className={cn(isDark && 'text-slate-200')}>Income</SelectItem>
                  <SelectItem value="expense" className={cn(isDark && 'text-slate-200')}>Expense</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : filteredTxns.length === 0 ? (
                <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  <ReceiptText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No transactions yet. Add your first one!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTxns.slice(0, 20).map((txn) => (
                    <div
                      key={txn.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg',
                        isDark ? 'bg-slate-800' : 'bg-slate-50'
                      )}
                    >
                      <div className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        txn.type === 'income'
                          ? (isDark ? 'bg-green-950' : 'bg-green-50')
                          : (isDark ? 'bg-red-950' : 'bg-red-50')
                      )}>
                        {txn.type === 'income'
                          ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                          : <ArrowDownRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-slate-900')}>
                          {txn.description || txn.category}
                        </p>
                        <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          {txn.category} &middot; {txn.date ? format(new Date(txn.date + 'T12:00:00'), 'MMM d') : ''}
                        </p>
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {txn.type === 'income' ? '+' : '-'}{currencySymbol}{Number(txn.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown">
          <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
            <CardHeader>
              <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                Expense Breakdown
              </CardTitle>
              <CardDescription className={cn(isDark && 'text-slate-400')}>
                Where your money goes this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length === 0 ? (
                <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No expenses this month yet.</p>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} width={80} />
                      <Tooltip
                        formatter={(value) => [`${currencySymbol}${value}`, 'Spent']}
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#fff',
                          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets">
          <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                  Monthly Budgets
                </CardTitle>
                <CardDescription className={cn(isDark && 'text-slate-400')}>
                  {format(new Date(), 'MMMM yyyy')}
                </CardDescription>
              </div>
              <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Set Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn(isDark && 'bg-slate-900 border-slate-700')}>
                  <DialogHeader>
                    <DialogTitle className={cn(isDark && 'text-white')}>Set Monthly Budget</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateBudget} className="space-y-4">
                    <div className="space-y-2">
                      <Label className={cn(isDark && 'text-slate-300')}>Category</Label>
                      <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm((p) => ({ ...p, category: v }))}>
                        <SelectTrigger className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                          {expenseCategories.map((c) => (
                            <SelectItem key={c} value={c} className={cn(isDark && 'text-slate-200')}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className={cn(isDark && 'text-slate-300')}>Monthly Limit ({currencySymbol})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="500"
                        value={budgetForm.monthly_limit}
                        onChange={(e) => setBudgetForm((p) => ({ ...p, monthly_limit: e.target.value }))}
                        required
                        className={cn(isDark && 'bg-slate-800 border-slate-700 text-white')}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline" className={cn(isDark && 'border-slate-700 text-slate-300')}>Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={createBudget.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {createBudget.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Set Budget
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {budgetProgress.length === 0 ? (
                <div className={cn('text-center py-10', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No budgets set for this month. Set one to start tracking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetProgress.map((b) => (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                          {b.category}
                        </span>
                        <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {currencySymbol}{b.spent.toFixed(2)} / {currencySymbol}{Number(b.monthly_limit).toFixed(2)}
                        </span>
                      </div>
                      <Progress
                        value={b.pct}
                        className={cn('h-2.5', isDark ? 'bg-slate-800' : 'bg-slate-100')}
                      />
                      {b.pct >= 90 && (
                        <p className="text-xs text-red-500 mt-1">
                          {b.pct >= 100 ? 'Over budget!' : 'Almost at your limit!'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
