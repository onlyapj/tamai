import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User, Moon, Sun, Loader2, LogOut, Save, Mail, Palette,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'JPY', label: 'JPY (\u00a5)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'INR', label: 'INR (\u20b9)' },
  { value: 'BRL', label: 'BRL (R$)' },
];

export default function Profile() {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const isDark = user?.theme === 'dark';

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ full_name: fullName.trim() });
    setSaving(false);
    if (error) {
      toast.error('Failed to update name.');
    } else {
      toast.success('Name updated!');
    }
  };

  const handleThemeToggle = async (checked) => {
    const newTheme = checked ? 'dark' : 'light';
    const { error } = await updateProfile({ theme: newTheme });
    if (error) {
      toast.error('Failed to update theme.');
    } else {
      toast.success(`Switched to ${newTheme} mode.`);
    }
  };

  const handleCurrencyChange = async (value) => {
    const { error } = await updateProfile({ currency: value });
    if (error) {
      toast.error('Failed to update currency.');
    } else {
      toast.success(`Currency set to ${value}.`);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/login');
  };

  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6')}>
      {/* Header */}
      <div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
          Profile
        </h1>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar & Info */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold',
              'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
            )}>
              {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                {user?.full_name || 'User'}
              </h2>
              <p className={cn('text-sm flex items-center gap-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription className={cn(isDark && 'text-slate-400')}>
            Update your display name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={cn(isDark && 'text-slate-300')}>Full Name</Label>
            <div className="flex gap-2">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={cn('flex-1', isDark && 'bg-slate-800 border-slate-700 text-white')}
              />
              <Button
                onClick={handleSaveName}
                disabled={saving || fullName === user?.full_name}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className={cn(isDark && 'text-slate-300')}>Email</Label>
            <Input
              value={user?.email || ''}
              disabled
              className={cn(isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500')}
            />
            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Email cannot be changed from this page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardHeader>
          <CardTitle className={cn('text-lg flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
            <Palette className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription className={cn(isDark && 'text-slate-400')}>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  Dark Mode
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {isDark ? 'Dark theme is active' : 'Switch to dark theme'}
                </p>
              </div>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={handleThemeToggle}
            />
          </div>

          <Separator className={cn(isDark && 'bg-slate-800')} />

          {/* Currency Selector */}
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Currency
              </p>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Used for finance tracking
              </p>
            </div>
            <Select value={user?.currency || 'USD'} onValueChange={handleCurrencyChange}>
              <SelectTrigger className={cn('w-36', isDark && 'bg-slate-800 border-slate-700 text-white')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={cn(isDark && 'bg-slate-800 border-slate-700')}>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value} className={cn(isDark && 'text-slate-200')}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className={cn('border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Sign Out
              </p>
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Sign out of your TAMAI account
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700',
                isDark && 'border-red-900 hover:bg-red-950'
              )}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
