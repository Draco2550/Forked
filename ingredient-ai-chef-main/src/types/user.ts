export interface UserProfile {
  name: string;
  age: number;
  heightFeet: number;
  heightInches: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'cutting' | 'maintain' | 'bulking' | 'custom';
  customCalories?: number;
}

export interface DetectedIngredient {
  id: string;
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessedImage {
  id: string;
  url: string;
  ingredients: DetectedIngredient[];
}

export type CuisineType = 
  | 'mexican'
  | 'chinese'
  | 'american'
  | 'italian'
  | 'indian'
  | 'japanese'
  | 'thai'
  | 'mediterranean';

export interface Recipe {
  id: string;
  name: string;
  cuisine: CuisineType;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
