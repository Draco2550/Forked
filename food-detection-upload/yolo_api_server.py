#!/usr/bin/env py
"""
YOLO API Server
A Flask API server that provides endpoints for YOLO object detection.
This server runs alongside the Node.js server to handle object detection requests.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time

# Add the parent directory to the path to import the YOLO integration
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from yolo_integration import YOLOIntegration
from ollama_recipe_generator import OllamaRecipeGenerator

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global YOLO integration instance
yolo_integration = None

# Global Ollama recipe generator instance
recipe_generator = None

def initialize_recipe_generator():
    """Initialize the Ollama recipe generator"""
    global recipe_generator
    try:
        # Get Ollama settings from environment variables or use defaults
        ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        ollama_model = os.getenv('OLLAMA_MODEL', 'qwen3:4b')
        recipe_generator = OllamaRecipeGenerator(base_url=ollama_url, model=ollama_model)
        print(f"Ollama recipe generator initialized with model: {ollama_model}")
    except Exception as e:
        print(f"Error initializing recipe generator: {e}")
        recipe_generator = None

def initialize_yolo():
    """Initialize the YOLO integration in a separate thread"""
    global yolo_integration
    try:
        # Try to find the model file
        model_paths = [
            './exp2/weights/best.pt',  # The custom trained model
            '../exp2/weights/best.pt',  # Relative path from food-detection-upload folder
            '../../runs/train/exp2/weights/best.pt',  # Two levels up
            'yolo11n.pt'  # Fallback to YOLOv11n. Will be inaccurate or might not work.
        ]
        
        model_path = None
        for path in model_paths:
            if os.path.exists(path):
                model_path = path
                break
        
        if model_path:
            print(f"Found model at: {model_path}")
            yolo_integration = YOLOIntegration(model_path)
        else:
            print("No model found, using YOLOv11n as fallback")
            yolo_integration = YOLOIntegration('yolo11n.pt')
            
    except Exception as e:
        print(f"Error initializing YOLO: {e}")
        yolo_integration = None
#testing above /health:

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "running",
        "message": "YOLO API is active. Use /health, /predict, etc."
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'yolo_loaded': yolo_integration is not None,
        'timestamp': time.time()
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """Predict on a single image"""
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        conf_threshold = data.get('conf_threshold', 0.7)
        iou_threshold = data.get('iou_threshold', 0.3)
        
        if not image_path:
            return jsonify({'error': 'image_path is required'}), 400
        
        if not os.path.exists(image_path):
            return jsonify({'error': f'Image file not found: {image_path}'}), 404
        
        if yolo_integration is None:
            return jsonify({'error': 'YOLO model not loaded'}), 500
        
        result = yolo_integration.predict_image(image_path, conf_threshold, iou_threshold)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Predict on multiple images"""
    try:
        data = request.get_json()
        image_paths = data.get('image_paths', [])
        conf_threshold = data.get('conf_threshold', 0.7)
        iou_threshold = data.get('iou_threshold', 0.3)
        
        if not image_paths:
            return jsonify({'error': 'image_paths is required'}), 400
        
        # Check if all images exist
        missing_images = [path for path in image_paths if not os.path.exists(path)]
        if missing_images:
            return jsonify({'error': f'Images not found: {missing_images}'}), 404
        
        if yolo_integration is None:
            return jsonify({'error': 'YOLO model not loaded'}), 500
        
        result = yolo_integration.predict_multiple_images(image_paths, conf_threshold, iou_threshold)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if yolo_integration is None:
        return jsonify({'error': 'YOLO model not loaded'}), 500
    
    return jsonify({
        'model_path': yolo_integration.model_path,
        'model_loaded': yolo_integration.model is not None,
        'class_names': list(yolo_integration.model.names.values()) if yolo_integration.model else []
    })

@app.route('/generate_recipes', methods=['POST'])
def generate_recipes():
    """Generate recipes from a list of ingredients using Ollama"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        num_recipes = data.get('num_recipes', 3)
        
        if not ingredients:
            return jsonify({'error': 'ingredients list is required'}), 400
        
        if recipe_generator is None:
            # Try to initialize if not already done
            initialize_recipe_generator()
            if recipe_generator is None:
                return jsonify({'error': 'Recipe generator not available'}), 500
        
        result = recipe_generator.generate_recipe(ingredients, num_recipes)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ollama_health', methods=['GET'])
def ollama_health():
    """Check if Ollama is available"""
    if recipe_generator is None:
        initialize_recipe_generator()
        if recipe_generator is None:
            return jsonify({
                'available': False,
                'error': 'Recipe generator not initialized'
            }), 500
    
    is_available = recipe_generator.check_ollama_available()
    return jsonify({
        'available': is_available,
        'model': recipe_generator.model,
        'base_url': recipe_generator.base_url
    })

def run_yolo_api_server(port=5000):
    """Run the YOLO API server"""
    print(f"Starting YOLO API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)

if __name__ == '__main__':
    # Initialize YOLO in a separate thread to avoid blocking
    yolo_thread = threading.Thread(target=initialize_yolo)
    yolo_thread.daemon = True
    yolo_thread.start()
    
    # Initialize recipe generator
    initialize_recipe_generator()
    
    # Start the Flask server
    run_yolo_api_server()

