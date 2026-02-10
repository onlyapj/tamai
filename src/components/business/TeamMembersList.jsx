import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, Loader2, Mail, MoreVertical, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamMembersList({ teamId, isAdmin }) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => base44.entities.TeamMember.filter({ team_id: teamId }),
    enabled: !!teamId
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const response = await base44.functions.invoke('inviteTeamMember', {
        team_id: teamId,
        invite_email: email,
        role
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      setShowInvite(false);
      setInviteEmail('');
      setInviteRole('member');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) => {
      await base44.entities.TeamMember.update(memberId, { role });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId) => {
      await base44.entities.TeamMember.update(memberId, { status: 'removed' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
  });

  const activeMembers = members.filter(m => m.status !== 'removed');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-900">Team Members</h2>
          <Badge variant="secondary" className="ml-2">{activeMembers.length}</Badge>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowInvite(!showInvite)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
      </div>

      {showInvite && (
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-3">
            <Input
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
              disabled={!inviteEmail || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : activeMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No team members yet
          </div>
        ) : (
          activeMembers.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium">
                  {member.user_name?.charAt(0) || member.user_email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {member.user_name || member.user_email}
                    </p>
                    {member.role === 'admin' && (
                      <Crown className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500">{member.user_email}</p>
                    {member.status === 'invited' && (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => updateRoleMutation.mutate({ 
                        memberId: member.id, 
                        role: member.role === 'admin' ? 'member' : 'admin' 
                      })}
                    >
                      {member.role === 'admin' ? (
                        <><User className="h-4 w-4 mr-2" /> Make Member</>
                      ) : (
                        <><Shield className="h-4 w-4 mr-2" /> Make Admin</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => removeMutation.mutate(member.id)}
                    >
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}