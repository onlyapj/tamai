import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Users,
  Settings,
  Plus,
  MoreVertical,
  Loader2,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Organizations() {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Get all teams the user owns or is a member of
  const { data: myTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['my-teams', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // Get teams user owns
      const ownedTeams = await base44.entities.Team.filter({ owner_email: user.email });
      // Get teams user is a member of
      const memberTeams = await base44.entities.TeamMember.filter({ user_email: user.email });
      const memberTeamIds = memberTeams.map(m => m.team_id);
      const memberTeamDetails = memberTeamIds.length > 0
        ? await Promise.all(memberTeamIds.map(id => base44.entities.Team.get(id)))
        : [];
      
      const allTeams = [...ownedTeams, ...memberTeamDetails];
      // Remove duplicates
      const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
      return uniqueTeams;
    },
    enabled: !!user?.email,
  });

  const selectedTeam = selectedTeamId ? myTeams.find(t => t.id === selectedTeamId) : myTeams[0];

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', selectedTeam?.id],
    queryFn: () => base44.entities.TeamMember.filter({ team_id: selectedTeam.id }),
    enabled: !!selectedTeam?.id,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name) => {
      return base44.entities.Team.create({
        name,
        owner_email: user.email,
        member_count: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams', user?.email] });
      setNewOrgName('');
      setShowNewOrgForm(false);
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (updates) => {
      return base44.entities.Team.update(selectedTeam.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-teams', user?.email] });
    },
  });

  const isOwner = selectedTeam?.owner_email === user?.email;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
              <p className="text-slate-600 mt-1">Manage teams, members, and settings</p>
            </div>
            <Button
              onClick={() => setShowNewOrgForm(!showNewOrgForm)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* New Organization Form */}
        {showNewOrgForm && (
          <Card className="mb-8 bg-indigo-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => createTeamMutation.mutate(newOrgName)}
                  disabled={!newOrgName || createTeamMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {createTeamMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Organization List */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Organizations</h2>
            <div className="space-y-2">
              {teamsLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" />
                </div>
              ) : myTeams.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="pt-6 text-center">
                    <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No organizations yet</p>
                  </CardContent>
                </Card>
              ) : (
                myTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTeam?.id === team.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900">{team.name}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {team.member_count || 1} member{(team.member_count || 1) !== 1 ? 's' : ''}
                    </p>
                    {team.owner_email === user?.email && (
                      <Badge className="mt-2 bg-amber-100 text-amber-800">Owner</Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Organization Details */}
          {selectedTeam && (
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Organization Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Organization Name</label>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{selectedTeam.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Owner</label>
                        <p className="mt-1 text-slate-600">{selectedTeam.owner_email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Plan</label>
                        <Badge className="mt-2 bg-blue-100 text-blue-800 capitalize">
                          {selectedTeam.plan_type || 'Starter'}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Members</label>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{members.length}</p>
                      </div>
                      {selectedTeam.description && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">Description</label>
                          <p className="mt-1 text-slate-600">{selectedTeam.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="mt-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {membersLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                        </div>
                      ) : members.length === 0 ? (
                        <p className="text-slate-600 text-sm">No members yet</p>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                                    {member.user_name?.charAt(0) || member.user_email?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{member.user_name || member.user_email}</p>
                                    <p className="text-xs text-slate-600">{member.user_email}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">
                                    {member.role}
                                  </Badge>
                                  {member.status === 'active' ? (
                                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-800">
                                      {member.status}
                                    </Badge>
                                  )}

                                  {isOwner && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Change role</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Organization Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isOwner ? (
                        <>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Organization Name</label>
                            <Input
                              defaultValue={selectedTeam.name}
                              onChange={(e) => updateTeamMutation.mutate({ name: e.target.value })}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-700">Allow members to invite</label>
                            <p className="text-xs text-slate-600 mt-1">
                              {selectedTeam.settings?.allow_members_to_invite ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-700">Public goals</label>
                            <p className="text-xs text-slate-600 mt-1">
                              {selectedTeam.settings?.public_goals ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>

                          <Button variant="destructive" className="w-full">
                            Delete Organization
                          </Button>
                        </>
                      ) : (
                        <p className="text-slate-600">Only organization owners can change settings.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}