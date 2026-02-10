import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Heart, Wallet, Activity, Target, CalendarDays, Watch, User, Users, BarChart3, Brain } from 'lucide-react';
import NotificationBell from './components/notifications/NotificationBell';
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const individualNavItems = [
      { name: 'Home', icon: LayoutDashboard, label: 'Home' },
      { name: 'Calendar', icon: CalendarDays, label: 'Calendar' },
      { name: 'Analytics', icon: BarChart3, label: 'Analytics' },
      { name: 'Mindfulness', icon: Heart, label: 'Mind' },
      { name: 'Finance', icon: Wallet, label: 'Money' },
      { name: 'Health', icon: Activity, label: 'Health' },
      { name: 'Goals', icon: Target, label: 'Goals' },
      { name: 'Profile', icon: User, label: 'Profile' },
    ];

    const businessNavItems = [
      { name: 'BusinessDashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { name: 'FinanceCFO', icon: Wallet, label: 'Finance' },
      { name: 'TaskManager', icon: Activity, label: 'Tasks' },
      { name: 'GoalsOKR', icon: Target, label: 'Goals' },
      { name: 'TeamManagement', icon: Users, label: 'Team' },
      { name: 'AIAssistant', icon: Brain, label: 'AI' },
      { name: 'Calendar', icon: CalendarDays, label: 'Calendar' },
      { name: 'Profile', icon: User, label: 'Profile' },
    ];

    const defaultNavItems = individualNavItems;

    const [navItems, setNavItems] = useState(defaultNavItems);

    const { data: user, isLoading } = useQuery({
      queryKey: ['current-user'],
      queryFn: () => base44.auth.me(),
      retry: false
    });

    // Update nav items based on account type
    useEffect(() => {
      if (user) {
        const baseItems = user.account_type === 'business' ? businessNavItems : individualNavItems;

        if (user?.nav_order) {
          const ordered = user.nav_order
            .map(name => baseItems.find(item => item.name === name))
            .filter(Boolean);
          const newItems = baseItems.filter(
            item => !user.nav_order.includes(item.name)
          );
          setNavItems([...ordered, ...newItems]);
        } else {
          setNavItems(baseItems);
        }
      }
    }, [user?.account_type, user?.nav_order]);

    // Redirect based on auth status
    useEffect(() => {
      if (!isLoading) {
        if (!user && currentPageName !== 'Landing') {
          // Not logged in, redirect to Landing
          navigate(createPageUrl('Landing'));
        } else if (user && currentPageName === 'Landing') {
          // Logged in, redirect away from Landing to Home
          navigate(createPageUrl('Home'));
        }
      }
    }, [user, isLoading, currentPageName, navigate]);



    // Show nothing while checking auth or redirecting
    if (!isLoading && !user && currentPageName !== 'Landing') {
      return null;
    }

  const saveOrderMutation = useMutation({
    mutationFn: (order) => base44.auth.updateMe({ nav_order: order }),
    onSuccess: () => queryClient.invalidateQueries(['current-user'])
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(navItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNavItems(items);
    saveOrderMutation.mutate(items.map(item => item.name));
  };

  const showWearableLink = currentPageName === 'Health';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Mode Toggle - Desktop */}
            <div className="hidden lg:block fixed top-0 right-0 z-50 bg-white border-b border-slate-200 w-full">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {user && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => base44.auth.updateMe({ current_mode: 'personal' })}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          user?.current_mode === 'personal'
                            ? 'bg-white text-indigo-600 font-medium shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Personal
                      </button>
                      <button
                        onClick={() => base44.auth.updateMe({ current_mode: 'business' })}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          user?.current_mode === 'business'
                            ? 'bg-white text-indigo-600 font-medium shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Business
                      </button>
                    </div>
                  </div>
                )}
                <NotificationBell />
              </div>
            </div>

      {/* Desktop Sidebar */}
      {user && (
        <nav className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-20 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col lg:items-center lg:py-8 lg:gap-4 z-50">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="nav-desktop" direction="vertical">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-3 items-center"
                >
                  {navItems.map((item, index) => (
                    <Draggable key={item.name} draggableId={item.name} index={index}>
                      {(provided, snapshot) => (
                        <Link
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          to={createPageUrl(item.name)}
                          className={cn(
                            "w-14 h-14 flex items-center justify-center rounded-xl transition-all",
                            currentPageName === item.name
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                            snapshot.isDragging && "shadow-lg bg-white"
                          )}
                          title={item.label}
                          style={provided.draggableProps.style}
                        >
                          <item.icon className="h-6 w-6" />
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </nav>
      )}

      {/* Top Navigation - Mobile */}
      {user && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="nav" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {navItems.map((item, index) => (
                    <Draggable key={item.name} draggableId={item.name} index={index}>
                      {(provided, snapshot) => (
                        <Link
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          to={createPageUrl(item.name)}
                          className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0",
                            currentPageName === item.name
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-slate-400 hover:text-slate-600",
                            snapshot.isDragging && "shadow-lg bg-white"
                          )}
                          style={provided.draggableProps.style}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </nav>
      )}

      {/* Main Content */}
      <main className={cn("pb-20", user && "lg:ml-20 lg:pb-0")}>
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