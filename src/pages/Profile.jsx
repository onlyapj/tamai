import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, LogOut, Save, Lock, Key, Sun, Moon, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Profile() {
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      setName(userData.full_name || '');
      setEmail(userData.email || '');
      
      // Apply theme preference
      if (userData.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return userData;
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: (theme) => base44.auth.updateMe({ theme }),
    onSuccess: (_, theme) => {
      queryClient.invalidateQueries(['current-user']);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      toast.success(`${theme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
    }
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: (currency) => base44.auth.updateMe({ currency }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      toast.success('Currency updated');
    }
  });

  const updateAccountTypeMutation = useMutation({
    mutationFn: (accountType) => base44.auth.updateMe({ account_type: accountType }),
    onSuccess: (_, accountType) => {
      queryClient.invalidateQueries(['current-user']);
      toast.success(`Switched to ${accountType === 'business' ? 'business' : 'personal'} account`);
    }
  });

  const updateNameMutation = useMutation({
    mutationFn: (newName) => base44.auth.updateMe({ full_name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      setIsEditingName(false);
      toast.success('Name updated successfully');
    },
    onError: () => {
      toast.error('Failed to update name');
    }
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail) => {
      const response = await base44.functions.invoke('updateUserEmail', { email: newEmail });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      setIsEditingEmail(false);
      toast.success('Email update requested. Please check your inbox to verify.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update email');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await base44.functions.invoke('changePassword', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  });

  const handleSaveName = () => {
    if (name.trim()) {
      updateNameMutation.mutate(name.trim());
    }
  };

  const handleSaveEmail = () => {
    if (email.trim() && email !== user.email) {
      updateEmailMutation.mutate(email.trim());
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleSignOut = () => {
    base44.auth.logout(createPageUrl('Landing'));
  };

  if (isLoading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center transition-colors duration-200", "bg-slate-50 text-slate-500")}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200", user?.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50')}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className={cn("text-2xl sm:text-3xl font-bold", user?.theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className={user?.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Manage your account settings</p>
        </div>

        <div className="space-y-4">
          {/* User Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <label className={cn("text-sm font-medium mb-2 block", user?.theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    Full Name
                  </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveName}
                      disabled={updateNameMutation.isPending || !name.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setName(user.full_name || '');
                        setIsEditingName(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className={cn("flex items-center justify-between p-3 rounded-lg", user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50')}>
                    <span className={user?.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>{user.full_name || 'Not set'}</span>
                    <Button 
                      onClick={() => setIsEditingName(true)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", user?.theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                {isEditingEmail ? (
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveEmail}
                      disabled={updateEmailMutation.isPending || !email.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setEmail(user.email || '');
                        setIsEditingEmail(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className={cn("flex items-center justify-between p-3 rounded-lg", user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50')}>
                    <span className={user?.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>{user.email}</span>
                    <Button 
                      onClick={() => setIsEditingEmail(true)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Theme */}
              <div>
                <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", user?.theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    {user?.theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Appearance
                  </label>
                <div className={cn("flex items-center justify-between p-3 rounded-lg", user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50')}>
                  <div className="flex items-center gap-3">
                    <Sun className={cn("h-4 w-4", user?.theme === 'dark' ? 'text-slate-400' : 'text-slate-600')} />
                    <span className={user?.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>Light Mode</span>
                  </div>
                  <Switch
                    checked={user?.theme === 'dark'}
                    onCheckedChange={(checked) => updateThemeMutation.mutate(checked ? 'dark' : 'light')}
                  />
                  <div className="flex items-center gap-3">
                    <span className={user?.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>Dark Mode</span>
                    <Moon className={cn("h-4 w-4", user?.theme === 'dark' ? 'text-slate-400' : 'text-slate-600')} />
                  </div>
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", user?.theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    <Building2 className="h-4 w-4" />
                    Account Type
                  </label>
                <Select
                  value={user?.account_type || 'individual'}
                  onValueChange={(value) => updateAccountTypeMutation.mutate(value)}
                >
                  <SelectTrigger className={user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Personal Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div>
                <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", user?.theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                    <DollarSign className="h-4 w-4" />
                    Currency
                  </label>
                <Select
                  value={user?.currency || 'USD'}
                  onValueChange={(value) => updateCurrencyMutation.mutate(value)}
                >
                  <SelectTrigger className={user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar ($)</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar ($)</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc (Fr)</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan (¥)</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                {isChangingPassword ? (
                  <div className="space-y-3">
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                    />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={changePasswordMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn("flex items-center justify-between p-3 rounded-lg", user?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50')}>
                    <span className={user?.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>••••••••</span>
                    <Button 
                      onClick={() => setIsChangingPassword(true)}
                      variant="ghost"
                      size="sm"
                    >
                      Change
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your session and access</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignOut}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}