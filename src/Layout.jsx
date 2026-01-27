import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Heart, Wallet, Activity, Target, Watch } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: LayoutDashboard, label: 'Home' },
    { name: 'Mindfulness', icon: Heart, label: 'Mind' },
    { name: 'Finance', icon: Wallet, label: 'Money' },
    { name: 'Health', icon: Activity, label: 'Health' },
    { name: 'Goals', icon: Target, label: 'Goals' },
  ];

  const showWearableLink = currentPageName === 'Health';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.name)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                currentPageName === item.name
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
        {children}
      </main>

      {/* Wearable Coming Soon Link - shown on Health page */}
      {showWearableLink && (
        <Link
          to={createPageUrl('Wearable')}
          className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-colors z-40"
        >
          <Watch className="h-4 w-4" />
          <span className="text-sm font-medium">Wearable</span>
          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">Soon</span>
        </Link>
      )}
    </div>
  );
}