import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { BarChart3, Users, TrendingUp, Target, ArrowRight, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export default function BusinessHome() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const stats = [
    { label: 'Team Members', value: '—', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Revenue', value: '—', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
    { label: 'Goals on Track', value: '—', icon: Target, color: 'from-amber-500 to-orange-500' },
    { label: 'Meetings This Week', value: '4', icon: Calendar, color: 'from-violet-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Business Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back, {user?.full_name || 'user'} • {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Getting Started
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">Invite Team Members</p>
                  <p className="text-xs text-slate-500">Add your team to collaborate</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">Set Organization Goals</p>
                  <p className="text-xs text-slate-500">Define team objectives</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">Configure Workspace</p>
                  <p className="text-xs text-slate-500">Customize settings</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-3">Team Collaboration Features</h2>
            <p className="text-indigo-100 mb-6">
              Organize your team's work, track progress, and achieve your business goals together.
            </p>
            <Button className="bg-white text-indigo-600 hover:bg-slate-50">
              Explore Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-amber-900 font-medium">🚀 Business features coming soon</p>
          <p className="text-amber-700 text-sm mt-1">We're building team management, reporting, and collaboration tools tailored for businesses.</p>
        </div>
      </div>
    </div>
  );
}