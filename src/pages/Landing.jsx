import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Check, Zap, Brain, Calendar, Sparkles, 
  TrendingUp, Users, Star, Shield, Workflow, Building2, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Task Planning',
      description: 'Automatically prioritizes and schedules your tasks based on deadlines and workload'
    },
    {
      icon: Calendar,
      title: 'Smart Calendar',
      description: 'Never miss a deadline with AI-driven scheduling that adapts to your capacity'
    },
    {
      icon: Sparkles,
      title: 'Meeting Summaries',
      description: 'AI generates summaries, action items, and sentiment analysis from your meetings'
    },
    {
      icon: Workflow,
      title: 'Habit & Goal Tracking',
      description: 'Build momentum with intelligent habit tracking and goal progression analytics'
    },
    {
      icon: TrendingUp,
      title: 'Financial Insights',
      description: 'Track investments, budgets, and spending with AI-powered insights'
    },
    {
      icon: Users,
      title: 'Mindfulness & Wellness',
      description: 'Mood tracking, journaling, and health logs for a balanced life'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      quote: 'TAMAI helped me reclaim 10+ hours per week by automating task prioritization. My team is now 40% more productive.',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Entrepreneur',
      quote: 'The meeting summaries alone are worth it. No more endless note-taking during calls.',
      avatar: '👨‍💼'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Healthcare Professional',
      quote: 'Finally have a tool that understands I need both productivity AND wellness. Life-changing.',
      avatar: '👩‍⚕️'
    },
    {
      name: 'David Kim',
      role: 'Investor',
      quote: 'TAMAI\'s investment tracking with AI insights helped me optimize my portfolio decisions.',
      avatar: '👨‍💼'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Active Users' },
    { number: '10M+', label: 'Tasks Managed' },
    { number: '95%', label: 'Satisfaction Rate' },
    { number: '12h/week', label: 'Average Time Saved' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Voted #1 AI Assistant for Personal Productivity</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Reclaim Your Time with
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Living
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Meet TAMAI—your personal AI assistant for productivity, wellness, and growth. Manage tasks, meetings, finances, health, and goals in one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto" onClick={() => {
              localStorage.setItem('signupAccountType', 'individual');
              base44.auth.redirectToLogin(createPageUrl('Home'));
            }}>
              I'm an Individual
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => {
              localStorage.setItem('signupAccountType', 'business');
              base44.auth.redirectToLogin(createPageUrl('Home'));
            }}>
              I'm a Business
            </Button>
          </div>

          <p className="text-sm text-slate-500">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Everything you need to thrive</h2>
            <p className="text-xl text-slate-600">All-in-one platform for productivity, wellness, and financial management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 transition-colors group">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Why choose TAMAI?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                'AI-powered task prioritization',
                'Smart meeting summaries with sentiment analysis',
                'Integrated calendar & scheduling',
                'Financial tracking & insights',
                'Mood & habit tracking'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                'Privacy-first & secure',
                'Google Calendar integration',
                'Team collaboration features',
                'AI-generated follow-up tasks',
                'Real-time analytics dashboard'
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Loved by productivity enthusiasts</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 sm:py-32 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to transform your life?</h2>
          <p className="text-xl text-indigo-100 mb-8">Join 500K+ users who've taken control of their time, health, and goals.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 w-full sm:w-auto" onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}>
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-indigo-100 text-sm mt-6">No credit card required. 14-day free trial.</p>

          <div className="mt-12 pt-12 border-t border-indigo-500 flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-indigo-100" />
            <span className="text-indigo-100">256-bit SSL encryption • GDPR compliant • Enterprise-grade security</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-white mb-4">✨ TAMAI</div>
              <p className="text-sm">Your AI assistant for productivity and wellness</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 TAMAI. All rights reserved.</p>
          </div>
        </div>
      </footer>



      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}