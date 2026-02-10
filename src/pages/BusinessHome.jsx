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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Business Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, {user?.full_name || 'user'} • {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          {!teams.length && (
            <Button onClick={() => setShowCreateTeam(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Create Your Team</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Team name"
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
            </div>
          </div>
        )}

        {teams.length > 0 ? (
          <>
            {/* Team Analytics */}
            <div className="mb-8">
              <TeamAnalytics teamId={teamId} />
            </div>

            {/* Team Members & Projects */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Placeholder for Projects */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Shared Projects
                  </h2>
                  <p className="text-slate-500 text-sm">Create and manage team projects to collaborate on goals.</p>
                  <Button className="mt-4 bg-slate-900 hover:bg-slate-800" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>

              <TeamMembersList teamId={teamId} isAdmin={true} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Create a team to get started with collaboration</p>
          </div>
        )}
      </div>
    </div>
  );
}