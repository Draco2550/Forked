import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { ProcessedImage, DetectedIngredient } from '@/types/user';
import { toast } from '@/hooks/use-toast';

// Mock ingredient detection - in production this would call YOLOv8 API
const mockDetectIngredients = async (imageUrl: string): Promise<DetectedIngredient[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const mockIngredients = [
    'Tomato', 'Onion', 'Garlic', 'Bell Pepper', 'Carrot', 'Potato',
    'Chicken', 'Beef', 'Eggs', 'Cheese', 'Lettuce', 'Cucumber',
    'Rice', 'Pasta', 'Bread', 'Milk', 'Butter', 'Olive Oil',
  ];

  const numIngredients = Math.floor(Math.random() * 4) + 2;
  const selectedIngredients = [...mockIngredients]
    .sort(() => Math.random() - 0.5)
    .slice(0, numIngredients);

  return selectedIngredients.map((name, idx) => ({
    id: `${Date.now()}-${idx}`,
    name,
    confidence: 0.75 + Math.random() * 0.24,
    boundingBox: {
      x: Math.random() * 60 + 10,
      y: Math.random() * 60 + 10,
      width: Math.random() * 20 + 15,
      height: Math.random() * 20 + 15,
    },
  }));
};

export const ImageUploader = () => {
  const { addProcessedImage, processedImages } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);

  const processFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setProcessingFiles((prev) => [...prev, fileId]);

    try {
      const imageUrl = URL.createObjectURL(file);
      const ingredients = await mockDetectIngredients(imageUrl);

      const processedImage: ProcessedImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        ingredients,
      };

      addProcessedImage(processedImage);
      toast({
        title: 'Image processed!',
        description: `Found ${ingredients.length} ingredients`,
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Could not analyze the image',
        variant: 'destructive',
      });
    } finally {
      setProcessingFiles((prev) => prev.filter((id) => id !== fileId));
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid files',
        description: 'Please upload image files only',
        variant: 'destructive',
      });
      return;
    }

    imageFiles.forEach(processFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const isProcessing = processingFiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
              isDragging ? 'gradient-primary shadow-glow' : 'bg-muted'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            )}
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">
            {isProcessing ? 'Processing images...' : 'Upload ingredient images'}
          </h3>
          <p className="text-muted-foreground text-sm text-center">
            {isDragging
              ? 'Drop your images here!'
              : 'Drag & drop or click to browse'}
          </p>
          {processingFiles.length > 0 && (
            <p className="text-primary text-sm mt-2">
              Processing {processingFiles.length} image{processingFiles.length > 1 ? 's' : ''}...
            </p>
          )}
        </label>
      </Card>

      {/* Processed Images Grid */}
      {processedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">
            Processed Images ({processedImages.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedImages.map((img) => (
              <ProcessedImageCard key={img.id} image={img} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProcessedImageCard = ({ image }: { image: ProcessedImage }) => {
  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300">
      <div className="relative aspect-video bg-muted">
        <img
          src={image.url}
          alt="Processed ingredient"
          className="w-full h-full object-cover"
        />
        {/* Detection boxes overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {image.ingredients.map((ing) => (
            <g key={ing.id}>
              <rect
                x={`${ing.boundingBox.x}%`}
                y={`${ing.boundingBox.y}%`}
                width={`${ing.boundingBox.width}%`}
                height={`${ing.boundingBox.height}%`}
                fill="none"
                stroke="hsl(16, 85%, 60%)"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={`${ing.boundingBox.x + 1}%`}
                y={`${ing.boundingBox.y - 1}%`}
                fill="hsl(16, 85%, 60%)"
                fontSize="10"
                fontWeight="600"
                className="font-sans"
              >
                {ing.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="p-4">
        <h4 className="font-medium text-sm mb-2">Detected Ingredients:</h4>
        <div className="flex flex-wrap gap-2">
          {image.ingredients.map((ing) => (
            <span
              key={ing.id}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
            >
              {ing.name} ({Math.round(ing.confidence * 100)}%)
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
