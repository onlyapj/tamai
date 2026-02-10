import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Smartphone, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const INTEGRATIONS = [
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'Sync steps, workouts, and health data from Apple Health',
    icon: '🍎',
    status: 'coming-soon'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Connect your Fitbit device for activity and sleep tracking',
    icon: '⌚',
    status: 'coming-soon'
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Integrate Garmin wearables for comprehensive health metrics',
    icon: '⌚',
    status: 'coming-soon'
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Get sleep and recovery insights from your Oura Ring',
    icon: '💍',
    status: 'coming-soon'
  }
];

export default function HealthDeviceIntegration() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = () => {
    if (email) {
      // TODO: Add to waitlist
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Health Device & App Integrations
        </h3>
        <p className="text-slate-600">Connect your wearables and health apps to automatically track wellness data.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration, idx) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 items-start flex-1">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    Coming Soon
                  </span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Waitlist CTA */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Get Early Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">Be the first to know when health device integrations launch. Get early access and special features!</p>
          
          {submitted ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Thanks! You're on the waitlist.</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleWaitlist}
                disabled={!email}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Join Waitlist
              </Button>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">These integrations securely sync your health data and use it only for personalized wellness recommendations.</p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Data Entry Option */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Data Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm mb-4">
            You can manually log your health metrics in the Health section while we work on device integrations.
          </p>
          <Button variant="outline">Go to Health Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}