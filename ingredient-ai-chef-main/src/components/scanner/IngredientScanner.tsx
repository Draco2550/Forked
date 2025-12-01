import React from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageUploader } from './ImageUploader';
import { ChevronRight, ChevronLeft, Trash2, UtensilsCrossed } from 'lucide-react';

export const IngredientScanner = () => {
  const { userProfile, allIngredients, processedImages, clearImages, setCurrentStep } = useApp();

  // Get unique ingredients
  const uniqueIngredients = Array.from(
    new Map(allIngredients.map((ing) => [ing.name, ing])).values()
  );

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep('onboarding')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="font-display text-xl font-bold">
            Hi, {userProfile?.name}! 👋
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Scan Your <span className="text-gradient">Ingredients</span>
            </h2>
            <p className="text-muted-foreground">
              Upload photos of your ingredients and our AI will identify them
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <ImageUploader />
            </div>

            {/* Ingredients Summary */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 shadow-elevated sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">
                    All Ingredients
                  </h3>
                  {processedImages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearImages}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {uniqueIngredients.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No ingredients detected yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Upload some images to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                      {uniqueIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="font-medium text-sm">{ing.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(ing.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3">
                        {uniqueIngredients.length} unique ingredient{uniqueIngredients.length !== 1 ? 's' : ''} from {processedImages.length} image{processedImages.length !== 1 ? 's' : ''}
                      </p>
                      <Button
                        variant="gradient"
                        className="w-full gap-2"
                        onClick={() => setCurrentStep('recipes')}
                      >
                        Generate Recipes
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
