import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, User, Ruler, Scale, Activity, Target } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Body Stats', icon: Ruler },
  { id: 3, title: 'Weight', icon: Scale },
  { id: 4, title: 'Activity', icon: Activity },
  { id: 5, title: 'Goal', icon: Target },
];

export const OnboardingWizard = () => {
  const { setUserProfile, setCurrentStep } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: undefined,
    heightFeet: undefined,
    heightInches: undefined,
    gender: undefined,
    weight: undefined,
    activityLevel: undefined,
    goal: undefined,
  });

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    if (isFormValid()) {
      setUserProfile(formData as UserProfile);
      setCurrentStep('scanner');
    }
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.age &&
      formData.heightFeet !== undefined &&
      formData.heightInches !== undefined &&
      formData.gender &&
      formData.weight &&
      formData.activityLevel &&
      formData.goal
    );
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.age && formData.gender;
      case 2:
        return formData.heightFeet !== undefined && formData.heightInches !== undefined;
      case 3:
        return formData.weight;
      case 4:
        return formData.activityLevel;
      case 5:
        return formData.goal;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step >= s.id
                      ? 'gradient-primary text-primary-foreground shadow-glow'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-8 h-1 rounded-full transition-all duration-300 ${
                      step > s.id ? 'gradient-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-center mb-2 text-foreground">
          {steps[step - 1].title}
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Step {step} of 5
        </p>

        {/* Form Card */}
        <Card className="p-6 shadow-elevated animate-scale-in gradient-card">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="age">How old are you?</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age || ''}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || undefined)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => updateField('gender', gender)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 capitalize ${
                        formData.gender === gender
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>What's your height?</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="feet" className="text-sm text-muted-foreground">Feet</Label>
                  <Input
                    id="feet"
                    type="number"
                    placeholder="5"
                    value={formData.heightFeet || ''}
                    onChange={(e) => updateField('heightFeet', parseInt(e.target.value) || undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="inches" className="text-sm text-muted-foreground">Inches</Label>
                  <Input
                    id="inches"
                    type="number"
                    placeholder="7"
                    min={0}
                    max={11}
                    value={formData.heightInches || ''}
                    onChange={(e) => updateField('heightInches', parseInt(e.target.value) || undefined)}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.heightFeet && formData.heightInches !== undefined
                  ? `${formData.heightFeet}'${formData.heightInches}" (${Math.round((formData.heightFeet * 12 + formData.heightInches) * 2.54)} cm)`
                  : 'Enter your height in feet and inches'}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label htmlFor="weight">What's your weight? (lbs)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter your weight"
                value={formData.weight || ''}
                onChange={(e) => updateField('weight', parseInt(e.target.value) || undefined)}
                className="mt-2"
              />
              {formData.weight && (
                <p className="text-sm text-muted-foreground">
                  {formData.weight} lbs ({Math.round(formData.weight * 0.453592)} kg)
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>What's your activity level?</Label>
              <div className="space-y-2 mt-2">
                {[
                  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                  { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                  { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                  { value: 'very_active', label: 'Extra Active', desc: 'Very hard exercise & physical job' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateField('activityLevel', level.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      formData.activityLevel === level.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Label>What's your goal?</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { value: 'cutting', label: 'Cutting', desc: 'Lose fat', emoji: '🔥' },
                  { value: 'maintain', label: 'Maintain', desc: 'Stay the same', emoji: '⚖️' },
                  { value: 'bulking', label: 'Bulking', desc: 'Build muscle', emoji: '💪' },
                  { value: 'custom', label: 'Custom', desc: 'Set your own', emoji: '🎯' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateField('goal', goal.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                      formData.goal === goal.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{goal.emoji}</div>
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-xs text-muted-foreground">{goal.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            {step < 5 ? (
              <Button
                variant="gradient"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="gap-2"
              >
                Start Scanning
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
