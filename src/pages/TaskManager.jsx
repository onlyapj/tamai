import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Users,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TaskManager() {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getProjectTasks', {});
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.functions.invoke('createTask', taskData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) =>
      base44.functions.invoke('updateTask', { taskId, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'active') return matchesSearch && task.status !== 'completed';
    if (activeTab === 'overdue') return matchesSearch && task.isOverdue;
    if (activeTab === 'completed') return matchesSearch && task.status === 'completed';
    return matchesSearch;
  });

  const overdueTasks = tasks.filter((t) => t.isOverdue && t.status !== 'completed');
  const blockingTasks = tasks.filter((t) => t.blockingCount > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Project Manager</h1>
              <p className="text-slate-600 mt-1">Less managing. More doing.</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alert Cards */}
        {overdueTasks.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-700">
                      These are blocking progress. Let's fix it.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="text-red-600">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {blockingTasks.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">
                      Bottleneck Detected: {blockingTasks.length} task{blockingTasks.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-amber-700">
                      These are blocking other work. Prioritize them.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="text-amber-600">
                  Reassign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active ({tasks.filter((t) => t.status !== 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({tasks.filter((t) => t.status === 'completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="py-12 text-center">
                  <Circle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No tasks in this view</p>
                  <p className="text-slate-500 text-sm mt-1">Create one to get started</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className="border-slate-200 hover:border-indigo-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <button
                        className="mt-1"
                        onClick={() =>
                          updateTaskMutation.mutate({
                            taskId: task.id,
                            data: {
                              status: task.status === 'completed' ? 'pending' : 'completed',
                            },
                          })
                        }
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold ${
                              task.status === 'completed'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800">High</Badge>
                          )}
                          {task.isOverdue && (
                            <Badge className="bg-orange-100 text-orange-800">Overdue</Badge>
                          )}
                          {task.blockingCount > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Blocking {task.blockingCount}
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-slate-600 text-sm mb-3">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {task.owner && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {task.owner}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {task.dueDate}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}