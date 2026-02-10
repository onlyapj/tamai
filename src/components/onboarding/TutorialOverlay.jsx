import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tutorialSteps = [
  {
    title: 'Welcome to TAMAI',
    description: 'Your AI-powered assistant for productivity, wellness, and growth. Let\'s take a quick tour!',
    target: null,
    position: 'center'
  },
  {
    title: 'Your Dashboard',
    description: 'Get a quick overview of your tasks, mood, finances, and goals all in one place.',
    target: '.quick-access-pillars',
    position: 'bottom'
  },
  {
    title: 'Create Tasks',
    description: 'Click "New Task" to add tasks. The AI will help prioritize them automatically.',
    target: 'button:contains("New Task")',
    position: 'left'
  },
  {
    title: 'Track Your Wellness',
    description: 'Log your daily mood, sleep, and activities to get personalized recommendations.',
    target: 'button:contains("AI Assistant")',
    position: 'left'
  },
  {
    title: 'Explore More',
    description: 'Check out Calendar, Finance, Health, and more in the sidebar. You can reorder them by dragging!',
    target: 'nav',
    position: 'right'
  }
];

export default function TutorialOverlay({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];
  const isLast = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999]">
        {/* Dimmed background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={handleSkip}
        />

        {/* Tutorial card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Step indicator */}
          <div className="flex gap-1 mb-4">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h2>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">{step.description}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Skip Tutorial
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}