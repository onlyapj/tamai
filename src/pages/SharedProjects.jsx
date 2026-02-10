import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, CheckCircle2, Clock } from 'lucide-react';
import ProjectForm from '../components/business/ProjectForm';
import ProjectCard from '../components/business/ProjectCard';

export default function SharedProjects() {
  const [teamId, setTeamId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Get user's team
  const { data: teams = [] } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const allTeams = await base44.entities.Team.list();
      return allTeams.filter(t => t.owner_email === user?.email);
    },
    enabled: !!user
  });

  useEffect(() => {
    if (teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [teams]);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['team-projects', teamId],
    queryFn: () => base44.entities.SharedProject.filter({ team_id: teamId }),
    enabled: !!teamId
  });

  const filteredProjects = {
    all: projects,
    planning: projects.filter(p => p.status === 'planning'),
    in_progress: projects.filter(p => p.status === 'in_progress'),
    completed: projects.filter(p => p.status === 'completed')
  }[filter] || [];

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: Target },
    { label: 'Active', value: projects.filter(p => p.status === 'in_progress').length, icon: Clock },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2 }
  ];

  if (!teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Team Found</h1>
          <p className="text-slate-600">Create a team on the Business Dashboard first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Team Projects
            </h1>
            <p className="text-slate-600">Manage shared projects and track team progress</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="mb-8">
            <ProjectForm 
              teamId={teamId} 
              onClose={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-slate-100/80 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All ({projects.length})
              </TabsTrigger>
              <TabsTrigger value="planning" className="data-[state=active]:bg-white">
                Planning
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-white">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
            <p className="text-slate-600 mb-4">Create your first team project to get started.</p>
            <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} teamId={teamId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}