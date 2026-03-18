import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Heart, Wallet, Activity,
  Target, CalendarDays, User, Smile,
} from 'lucide-react';

const navItems = [
  { path: '/home', icon: LayoutDashboard, label: 'Home' },
  { path: '/habits', icon: Activity, label: 'Habits' },
  { path: '/mood', icon: Smile, label: 'Mood' },
  { path: '/health', icon: Heart, label: 'Health' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isDark = user?.theme === 'dark';

  return (
    <div className={cn('min-h-screen transition-colors', isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900')}>
      {/* Desktop Sidebar */}
      <nav className={cn(
        'hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-20 lg:flex lg:flex-col lg:items-center lg:py-8 lg:gap-2 z-50 lg:border-r transition-colors',
        isDark ? 'lg:bg-slate-900 lg:border-slate-700' : 'lg:bg-white lg:border-slate-200'
      )}>
        <div className="mb-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">T</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all gap-1',
                isActive
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400'
                  : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              )}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 border-t z-50 transition-colors',
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 lg:ml-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
