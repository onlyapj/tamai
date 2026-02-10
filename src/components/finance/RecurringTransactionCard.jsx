import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Pause, Play, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categoryColors = {
  housing: 'bg-blue-100 text-blue-600',
  transport: 'bg-purple-100 text-purple-600',
  food: 'bg-orange-100 text-orange-600',
  utilities: 'bg-yellow-100 text-yellow-600',
  entertainment: 'bg-pink-100 text-pink-600',
  health: 'bg-rose-100 text-rose-600',
  shopping: 'bg-indigo-100 text-indigo-600',
  savings: 'bg-emerald-100 text-emerald-600',
  income: 'bg-green-100 text-green-600',
  investment: 'bg-teal-100 text-teal-600',
  other: 'bg-slate-100 text-slate-600'
};

export default function RecurringTransactionCard({ 
  transaction, 
  currencySymbol, 
  onEdit, 
  onTogglePause, 
  onDelete,
  isPaused 
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isIncome = transaction.type === 'income';

  const handleDelete = (applyTo) => {
    onDelete(applyTo);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl border p-4 ${isPaused ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${categoryColors[transaction.category] || categoryColors.other}`}>
            {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {transaction.description || transaction.sub_category || transaction.category}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {transaction.recurring_pattern} • {transaction.category?.replace('_', ' ')}
                </p>
              </div>
              <p className={`font-semibold text-lg ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                {currencySymbol}{transaction.amount?.toLocaleString()}
              </p>
            </div>

            {transaction.next_occurrence && !isPaused && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                Next: {format(new Date(transaction.next_occurrence), 'MMM d, yyyy')}
              </div>
            )}

            {isPaused && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                <Pause className="h-3 w-3" />
                Paused
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-slate-600 hover:text-slate-800"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePause}
            className="flex-1 text-slate-600 hover:text-slate-800"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 mr-1.5" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Choose what to delete:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDelete('template')}
            >
              <div className="text-left">
                <p className="font-medium">Delete template only</p>
                <p className="text-xs text-slate-500">Keep past transactions, stop future ones</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDelete('future')}
            >
              <div className="text-left">
                <p className="font-medium">Delete future occurrences</p>
                <p className="text-xs text-slate-500">Keep past transactions, delete upcoming ones</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDelete('all')}
            >
              <div className="text-left">
                <p className="font-medium">Delete all occurrences</p>
                <p className="text-xs text-slate-500">Remove all past and future transactions</p>
              </div>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}