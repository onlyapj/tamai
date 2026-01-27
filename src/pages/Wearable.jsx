import React from 'react';
import { motion } from 'framer-motion';
import { Watch, Heart, Moon, Activity, Zap, Bell, BatteryFull, Bluetooth } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Wearable() {
  const features = [
    { icon: Heart, label: 'Heart Rate', description: 'Continuous monitoring' },
    { icon: Moon, label: 'Sleep Tracking', description: 'Quality & duration' },
    { icon: Activity, label: 'Activity', description: 'Steps & movement' },
    { icon: Zap, label: 'HRV Recovery', description: 'Daily readiness score' },
    { icon: Bell, label: 'Silent Reminders', description: 'Gentle vibrations' },
    { icon: BatteryFull, label: 'Battery', description: '5-7 day life' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Coming Soon
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            TAMAI <span className="text-slate-400">Wearable</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            A calm, intelligent companion that adapts your day based on your body's signals. 
            No obsessive metrics. Just gentle guidance.
          </p>

          {/* Wearable Visual */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-48 h-48 mx-auto mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border-4 border-slate-600 shadow-2xl" />
            <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
              <div className="text-center">
                <Watch className="h-12 w-12 text-white mx-auto mb-2" />
                <p className="text-white font-bold">TAMAI</p>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-2xl" />
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700"
            >
              <feature.icon className="h-6 w-6 text-indigo-400 mb-2" />
              <p className="text-white font-medium">{feature.label}</p>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Philosophy Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Our Philosophy</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              <strong className="text-white">No raw metrics.</strong> We translate biometrics into 
              actionable, human language. "You're well recovered" instead of "HRV: 68ms".
            </p>
            <p>
              <strong className="text-white">No competition.</strong> Your body is unique. 
              No leaderboards, no comparisons, no pressure.
            </p>
            <p>
              <strong className="text-white">Adaptive scheduling.</strong> Had poor sleep? 
              TAMAI automatically suggests a lighter day.
            </p>
          </div>
        </motion.div>

        {/* Waitlist CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-slate-400 mb-4">Be the first to know when TAMAI Wearable launches</p>
          <div className="flex gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button className="bg-indigo-600 hover:bg-indigo-700 px-6">
              Notify Me
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-3">We respect your privacy. No spam, ever.</p>
        </motion.div>
      </div>
    </div>
  );
}