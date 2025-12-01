import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, ProcessedImage, DetectedIngredient } from '@/types/user';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  processedImages: ProcessedImage[];
  addProcessedImage: (image: ProcessedImage) => void;
  clearImages: () => void;
  allIngredients: DetectedIngredient[];
  currentStep: 'onboarding' | 'scanner' | 'recipes';
  setCurrentStep: (step: 'onboarding' | 'scanner' | 'recipes') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [currentStep, setCurrentStep] = useState<'onboarding' | 'scanner' | 'recipes'>('onboarding');

  const addProcessedImage = (image: ProcessedImage) => {
    setProcessedImages((prev) => [...prev, image]);
  };

  const clearImages = () => {
    setProcessedImages([]);
  };

  const allIngredients = processedImages.flatMap((img) => img.ingredients);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        processedImages,
        addProcessedImage,
        clearImages,
        allIngredients,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
