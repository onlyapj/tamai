import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  Mail,
  MoreVertical,
  Loader2,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamManagement() {
  const [teamId, setTeamId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: team } = useQuery({
    queryKey: ['team', user?.email],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ owner_email: user?.email });
      if (teams.length > 0) {
        setTeamId(teams[0].id);
        return teams[0];
      }
      return null;
    },
    enabled: !!user?.email,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => base44.entities.TeamMember.filter({ team_id: teamId }),
    enabled: !!teamId,
  });

  const { data: analytics } = useQuery({
    queryKey: ['team-analytics', teamId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTeamAnalytics', { teamId });
      return response.data;
    },
    enabled: !!teamId,
  });

  const inviteMutation = useMutation({
    mutationFn: async (email) => {
      const response = await base44.functions.invoke('inviteTeamMember', {
        team_id: teamId,
        invite_email: email,
        role: 'member'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      setInviteEmail('');
      setShowInviteForm(false);
    },
  });

  const overloadedMembers = members.filter(m => m.workload_percentage > 120);

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="font-semibold text-slate-900 mb-2">No team yet</p>
            <p className="text-sm text-slate-600 mb-6">Create a team to manage members and roles</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Create Team</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
              <p className="text-slate-600 mt-1">Assign roles, track capacity, detect bottlenecks</p>
            </div>
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Invite Form */}
        {showInviteForm && (
          <Card className="mb-8 bg-indigo-50 border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Email address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => inviteMutation.mutate(inviteEmail)}
                  disabled={!inviteEmail || inviteMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send Invite'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {overloadedMembers.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {overloadedMembers.length} team member{overloadedMembers.length !== 1 ? 's' : ''} overloaded
                    </p>
                    <p className="text-sm text-red-700">
                      Productivity will suffer. Recommend redistributing work.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="text-red-600">
                  Rebalance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Team Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{members.length}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Avg Workload</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {analytics?.avgWorkload ? Math.round(analytics.avgWorkload) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 font-medium">Task Completion</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {analytics?.completionRate ? Math.round(analytics.completionRate) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

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
                  <p className="text-slate-600 text-sm">No team members yet</p>
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
                            <Badge variant="outline">{member.role}</Badge>
                            {member.workload_percentage > 100 && (
                              <Badge className="bg-red-100 text-red-800">
                                {member.workload_percentage}% load
                              </Badge>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Change role</DropdownMenuItem>
                              <DropdownMenuItem>Reassign tasks</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-slate-900">{member.user_name || member.user_email}</p>
                        <span className="text-sm text-slate-600">{member.workload_percentage || 0}% capacity</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            (member.workload_percentage || 0) > 120
                              ? 'bg-red-600'
                              : (member.workload_percentage || 0) > 100
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(member.workload_percentage || 0, 150)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['Admin', 'Manager', 'Editor', 'Viewer'].map((role) => (
                    <div key={role} className="p-4 border border-slate-200 rounded-lg">
                      <p className="font-medium text-slate-900 mb-2">{role}</p>
                      <ul className="text-sm text-slate-600 space-y-1 ml-4">
                        <li>• Manage team & settings</li>
                        <li>• Create & edit projects</li>
                        <li>• View all data</li>
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}