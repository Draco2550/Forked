import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CuisineType, Recipe } from '@/types/user';
import { ChevronLeft, Clock, Flame, Beef, Wheat, Droplets, Loader2, RefreshCw } from 'lucide-react';

const cuisines: { value: CuisineType; label: string; emoji: string }[] = [
  { value: 'mexican', label: 'Mexican', emoji: '🌮' },
  { value: 'chinese', label: 'Chinese', emoji: '🥡' },
  { value: 'american', label: 'American', emoji: '🍔' },
  { value: 'italian', label: 'Italian', emoji: '🍝' },
  { value: 'indian', label: 'Indian', emoji: '🍛' },
  { value: 'japanese', label: 'Japanese', emoji: '🍱' },
  { value: 'thai', label: 'Thai', emoji: '🥢' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🥗' },
];

// Mock recipe generation
const generateMockRecipe = (ingredients: string[], cuisine: CuisineType): Recipe => {
  const recipeNames: Record<CuisineType, string[]> = {
    mexican: ['Spicy Tacos', 'Chicken Burrito Bowl', 'Fresh Salsa Verde', 'Enchiladas'],
    chinese: ['Stir Fry Vegetables', 'Kung Pao Style', 'Fried Rice', 'Sweet & Sour'],
    american: ['Classic Burger', 'BBQ Chicken', 'Mac & Cheese', 'Grilled Steak'],
    italian: ['Pasta Primavera', 'Chicken Parmesan', 'Bruschetta', 'Risotto'],
    indian: ['Butter Chicken', 'Vegetable Curry', 'Tandoori Grill', 'Biryani'],
    japanese: ['Teriyaki Bowl', 'Miso Soup', 'Donburi', 'Yakitori'],
    thai: ['Pad Thai Style', 'Green Curry', 'Tom Yum', 'Basil Stir Fry'],
    mediterranean: ['Greek Salad', 'Hummus Plate', 'Grilled Kabobs', 'Falafel Bowl'],
  };

  const names = recipeNames[cuisine];
  const name = names[Math.floor(Math.random() * names.length)];

  return {
    id: `recipe-${Date.now()}-${Math.random()}`,
    name: `${name} with ${ingredients.slice(0, 2).join(' & ')}`,
    cuisine,
    ingredients: ingredients.slice(0, Math.min(ingredients.length, 6)),
    instructions: [
      'Prepare all ingredients by washing and cutting as needed.',
      'Heat oil in a large pan over medium-high heat.',
      'Add the main ingredients and cook for 5-7 minutes.',
      'Season with salt, pepper, and your favorite spices.',
      'Serve hot and enjoy!',
    ],
    prepTime: Math.floor(Math.random() * 15) + 10,
    cookTime: Math.floor(Math.random() * 25) + 15,
    calories: Math.floor(Math.random() * 300) + 300,
    protein: Math.floor(Math.random() * 20) + 20,
    carbs: Math.floor(Math.random() * 30) + 30,
    fat: Math.floor(Math.random() * 15) + 10,
  };
};

export const RecipeGenerator = () => {
  const { allIngredients, setCurrentStep, userProfile } = useApp();
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const uniqueIngredientNames = Array.from(
    new Set(allIngredients.map((ing) => ing.name))
  );

  const toggleCuisine = (cuisine: CuisineType) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const generateRecipes = async () => {
    if (selectedCuisines.length === 0) return;

    setIsGenerating(true);
    setRecipes([]);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generatedRecipes = selectedCuisines.map((cuisine) =>
      generateMockRecipe(uniqueIngredientNames, cuisine)
    );

    setRecipes(generatedRecipes);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep('scanner')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Scanner
          </Button>
          <h1 className="font-display text-xl font-bold">Recipe Generator</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Generate <span className="text-gradient">Recipes</span>
            </h2>
            <p className="text-muted-foreground">
              Choose your preferred cuisines and we'll create recipes with your ingredients
            </p>
          </div>

          {/* Ingredients Summary */}
          <Card className="p-4 mb-6 animate-slide-up">
            <h3 className="font-medium text-sm mb-2">Your Ingredients:</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueIngredientNames.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 text-sm rounded-full bg-accent/10 text-accent font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </Card>

          {/* Cuisine Selection */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-display text-lg font-semibold mb-4">
              Select Cuisines
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine.value}
                  onClick={() => toggleCuisine(cuisine.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    selectedCuisines.includes(cuisine.value)
                      ? 'border-primary bg-primary/10 shadow-soft'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <span className="text-2xl block mb-1">{cuisine.emoji}</span>
                  <span className="font-medium text-sm">{cuisine.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                variant="gradient"
                size="lg"
                onClick={generateRecipes}
                disabled={selectedCuisines.length === 0 || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Generate Recipes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Recipes */}
          {recipes.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-display text-lg font-semibold mb-4">
                Your Recipes ({recipes.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-elevated ${
                      selectedRecipe?.id === recipe.id
                        ? 'ring-2 ring-primary shadow-elevated'
                        : 'shadow-soft'
                    }`}
                    onClick={() =>
                      setSelectedRecipe(
                        selectedRecipe?.id === recipe.id ? null : recipe
                      )
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-2xl mr-2">
                          {cuisines.find((c) => c.value === recipe.cuisine)?.emoji}
                        </span>
                        <h4 className="font-display text-lg font-semibold inline">
                          {recipe.name}
                        </h4>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {recipe.calories} cal
                      </span>
                    </div>

                    {/* Nutrition */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Beef className="w-4 h-4 mx-auto mb-1 text-primary" />
                        <span className="text-xs font-medium">{recipe.protein}g</span>
                        <span className="text-xs text-muted-foreground block">Protein</span>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Wheat className="w-4 h-4 mx-auto mb-1 text-secondary" />
                        <span className="text-xs font-medium">{recipe.carbs}g</span>
                        <span className="text-xs text-muted-foreground block">Carbs</span>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <Droplets className="w-4 h-4 mx-auto mb-1 text-accent" />
                        <span className="text-xs font-medium">{recipe.fat}g</span>
                        <span className="text-xs text-muted-foreground block">Fat</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedRecipe?.id === recipe.id && (
                      <div className="pt-4 border-t border-border animate-fade-in">
                        <h5 className="font-medium text-sm mb-2">Ingredients Used:</h5>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {recipe.ingredients.map((ing) => (
                            <span
                              key={ing}
                              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>

                        <h5 className="font-medium text-sm mb-2">Instructions:</h5>
                        <ol className="space-y-2">
                          {recipe.instructions.map((step, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
