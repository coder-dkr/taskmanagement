import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  hasCompletedTour: boolean;
  setTourComplete: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedTour: false,
      setTourComplete: () => set({ hasCompletedTour: true }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);

export const useOnboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasCompletedTour, setTourComplete } = useOnboardingStore();

  const steps = [
    {
      target: '.tour-dashboard',
      content: 'Welcome to your Task Management Dashboard! This is where you can see all your important metrics and tasks.',
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-navigation',
      content: 'Navigate through different sections of the app using this sidebar.',
      placement: 'right' as const,
    },
    {
      target: '.tour-overview',
      content: 'Get a quick overview of your task statistics here.',
      placement: 'bottom' as const,
    },
    {
      target: '.tour-hierarchical',
      content: 'View and manage your tasks in a hierarchical structure, organized by clients and entities.',
      placement: 'left' as const,
    },
    {
      target: '.tour-charts',
      content: 'Track your task progress and distribution with these visual charts.',
      placement: 'left' as const,
    },
    {
      target: '.tour-theme',
      content: 'Switch between light and dark mode for better visibility.',
      placement: 'bottom' as const,
    },
  ];

  useEffect(() => {
    if (!hasCompletedTour) {
      setIsOpen(true);
    }
  }, [hasCompletedTour]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (status === 'finished') {
      setTourComplete();
      setIsOpen(false);
    }
  };

  return {
    isOpen,
    steps,
    handleJoyrideCallback,
    setIsOpen,
  };
};
