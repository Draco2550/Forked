import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { IngredientScanner } from '@/components/scanner/IngredientScanner';
import { RecipeGenerator } from '@/components/recipes/RecipeGenerator';

const AppContent = () => {
  const { currentStep } = useApp();

  return (
    <>
      {currentStep === 'onboarding' && <OnboardingWizard />}
      {currentStep === 'scanner' && <IngredientScanner />}
      {currentStep === 'recipes' && <RecipeGenerator />}
    </>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
