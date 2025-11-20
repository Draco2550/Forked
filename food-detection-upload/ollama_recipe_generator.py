#!/usr/bin/env python
"""
Ollama Recipe Generator
This module provides functionality to generate recipes from detected ingredients using a local Ollama LLM.
"""

import os
import json
import requests
from typing import List, Dict, Any, Optional

class OllamaRecipeGenerator:
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "qwen3:4b"):
        """
        Initialize the Ollama Recipe Generator
        
        Args:
            base_url: Base URL for the Ollama API (default: http://localhost:11434)
            model: Name of the Ollama model to use (default: qwen3:4b)
        """
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.api_url = f"{self.base_url}/api/generate"
    
    def check_ollama_available(self) -> bool:
        """
        Check if Ollama is available and the model exists
        
        Returns:
            True if Ollama is available, False otherwise
        """
        try:
            # Check if Ollama is running
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [m.get('name', '') for m in models]
                # Check if the specified model exists
                if any(self.model in name for name in model_names):
                    return True
                else:
                    print(f"Warning: Model '{self.model}' not found. Available models: {model_names}")
                    return False
            return False
        except requests.exceptions.RequestException as e:
            print(f"Ollama not available: {e}")
            return False
    
    def generate_recipe(self, ingredients: List[str], num_recipes: int = 3) -> Dict[str, Any]:
        """
        Generate recipes from a list of ingredients
        
        Args:
            ingredients: List of detected ingredient names
            num_recipes: Number of recipes to generate (default: 3)
            
        Returns:
            Dictionary containing the generated recipes
        """
        if not ingredients:
            return {
                'success': False,
                'error': 'No ingredients provided'
            }
        
        # Check if Ollama is available
        if not self.check_ollama_available():
            return {
                'success': False,
                'error': 'Ollama is not available or model not found. Please ensure Ollama is running and the model is installed.'
            }
        
        # Create prompt for recipe generation
        ingredients_str = ', '.join(ingredients)
        prompt = f"""You are a professional chef. Given the following ingredients: {ingredients_str}

Please provide {num_recipes} detailed recipes that can be made using these ingredients. For each recipe, include:
1. Recipe name
2. Brief description
3. Ingredients list (you can suggest additional common ingredients if needed)
4. Step-by-step instructions
5. Estimated cooking time

Format your response as a clear, well-structured list. Be creative and practical with your recipe suggestions."""

        try:
            # Send request to Ollama
            response = requests.post(
                self.api_url,
                json={
                    'model': self.model,
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.7,
                        'top_p': 0.9,
                    }
                },
                timeout=120  # 2 minute timeout for recipe generation
            )
            
            if response.status_code == 200:
                result = response.json()
                recipe_text = result.get('response', '')
                
                return {
                    'success': True,
                    'ingredients': ingredients,
                    'recipes': recipe_text,
                    'model': self.model,
                    'num_recipes_requested': num_recipes
                }
            else:
                return {
                    'success': False,
                    'error': f'Ollama API returned status code {response.status_code}',
                    'details': response.text
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Request to Ollama timed out. The model may be too slow or unavailable.'
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Error communicating with Ollama: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def generate_recipe_streaming(self, ingredients: List[str], num_recipes: int = 3):
        """
        Generate recipes with streaming response (for real-time display)
        
        Args:
            ingredients: List of detected ingredient names
            num_recipes: Number of recipes to generate (default: 3)
            
        Yields:
            Chunks of the recipe text as they are generated
        """
        if not ingredients:
            yield json.dumps({
                'success': False,
                'error': 'No ingredients provided'
            })
            return
        
        ingredients_str = ', '.join(ingredients)
        prompt = f"""You are a professional chef. Given the following ingredients: {ingredients_str}

Please provide {num_recipes} detailed recipes that can be made using these ingredients. For each recipe, include:
1. Recipe name
2. Brief description
3. Ingredients list (you can suggest additional common ingredients if needed)
4. Step-by-step instructions
5. Estimated cooking time

Format your response as a clear, well-structured list. Be creative and practical with your recipe suggestions."""

        try:
            response = requests.post(
                self.api_url,
                json={
                    'model': self.model,
                    'prompt': prompt,
                    'stream': True,
                    'options': {
                        'temperature': 0.7,
                        'top_p': 0.9,
                    }
                },
                stream=True,
                timeout=120
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if 'response' in chunk:
                                yield chunk['response']
                            if chunk.get('done', False):
                                break
                        except json.JSONDecodeError:
                            continue
            else:
                yield json.dumps({
                    'success': False,
                    'error': f'Ollama API returned status code {response.status_code}'
                })
                
        except Exception as e:
            yield json.dumps({
                'success': False,
                'error': f'Error: {str(e)}'
            })


def main():
    """Main function for testing the recipe generator"""
    generator = OllamaRecipeGenerator(model="qwen3:4b")
    
    # Test with sample ingredients
    test_ingredients = ["tomato", "onion", "garlic", "basil"]
    print(f"Generating recipes for: {', '.join(test_ingredients)}")
    print("-" * 50)
    
    result = generator.generate_recipe(test_ingredients, num_recipes=2)
    
    if result['success']:
        print("Recipes generated successfully!")
        print("\n" + result['recipes'])
    else:
        print(f"Error: {result['error']}")


if __name__ == "__main__":
    main()

