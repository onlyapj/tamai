import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { BarChart3, Users, TrendingUp, Target, ArrowRight, Calendar, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import TeamMembersList from '../components/business/TeamMembersList';
import TeamAnalytics from '../components/business/TeamAnalytics';

export default function BusinessHome() {
  const [teamId, setTeamId] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Get or create team for business user
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

  const createTeamMutation = useMutation({
    mutationFn: async (name) => {
      return base44.entities.Team.create({
        name,
        owner_email: user.email,
        member_count: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      setShowCreateTeam(false);
      setTeamName('');
    }
  });

  const userTeamRole = teams.length > 0 
    ? (user ? 'admin' : 'member')
    : null;

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Business Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, {user.full_name} • {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          {!teams.length && (
            <Button onClick={() => setShowCreateTeam(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>

        {/* Create Team Form */}
        {showCreateTeam && (
          <div className="mb-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Create Your Team</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Team name (e.g., Acme Inc.)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => createTeamMutation.mutate(teamName)}
                disabled={!teamName || createTeamMutation.isPending}
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {teams.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Team Yet</h3>
            <p className="text-slate-600 mb-4">Create a team to start collaborating with your members.</p>
            <Button onClick={() => setShowCreateTeam(true)} className="bg-indigo-600 hover:bg-indigo-700">
              Create Your First Team
            </Button>
          </div>
        ) : (
          <>
            {/* Team Analytics */}
            <div className="mb-8">
              <TeamAnalytics teamId={teamId} />
            </div>

            {/* Team Members & Projects */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Link to={createPageUrl('SharedProjects')} className="inline-block w-full">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-5 w-5 text-indigo-600" />
                      <h2 className="font-semibold text-slate-900">Team Projects</h2>
                    </div>
                    <p className="text-slate-600 text-sm">Manage shared projects, assign tasks, and track team progress.</p>
                    <div className="mt-4 text-indigo-600 text-sm font-medium flex items-center gap-1">
                      Go to Projects <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </div>

              <TeamMembersList teamId={teamId} isAdmin={userTeamRole === 'admin'} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}