import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, BarChart3, CheckCircle2, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TeamAnalytics({ teamId }) {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['team-analytics', teamId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTeamAnalytics', {
        team_id: teamId
      });
      return response.data;
    },
    enabled: !!teamId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load team analytics
      </div>
    );
  }

  const stats = [
    {
      label: 'Team Members',
      value: analytics.team.member_count,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Projects',
      value: analytics.projects.active,
      icon: Zap,
      color: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Completion Rate',
      value: `${analytics.tasks.completion_rate}%`,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Total Tasks',
      value: analytics.tasks.total,
      icon: BarChart3,
      color: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projects Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Active Projects</span>
              <span className="text-sm text-slate-600">{analytics.projects.active} of {analytics.projects.total}</span>
            </div>
            <Progress value={(analytics.projects.active / (analytics.projects.total || 1)) * 100} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Task Completion</span>
              <span className="text-sm text-slate-600">{analytics.tasks.completed} of {analytics.tasks.total}</span>
            </div>
            <Progress value={analytics.tasks.completion_rate} />
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}