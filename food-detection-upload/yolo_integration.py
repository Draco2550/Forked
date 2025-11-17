#!/usr/bin/env py
"""
YOLOv11n Integration Module
This module provides an API wrapper for the YOLOv11n model to be called from the Node.js server.
"""

import os
import sys
import json
import base64
from pathlib import Path
from typing import List, Dict, Any
import cv2
import numpy as np
from ultralytics import YOLO

class YOLOIntegration:
    def __init__(self, model_path: str = None):
        """
        Initialize the YOLO integration
        
        Args:
            model_path: Path to the YOLO model weights file
        """
        self.model_path = model_path or 'exp2/weights/best.pt' # runs/train/exp2/weights/best.pt orignal
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the YOLO model"""
        try:
            # Check if model file exists
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            print(f"Loading YOLO model from: {self.model_path}")
            self.model = YOLO(self.model_path)
            print("Model loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            # Fallback to YOLOv11n if custom model not found
            try:
                print("Trying to load YOLOv11n as fallback...")
                self.model = YOLO('yolo11n.pt')
                print("YOLOv11n loaded as fallback!")
            except Exception as e2:
                print(f"Error loading fallback model: {e2}")
                raise e2
    
    def predict_image(self, image_path: str, conf_threshold: float = 0.7, iou_threshold: float = 0.3) -> Dict[str, Any]:
        """
        Run prediction on a single image
        
        Args:
            image_path: Path to the image file
            conf_threshold: Confidence threshold for detections
            iou_threshold: IoU threshold for NMS
            
        Returns:
            Dictionary containing detection results
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        try:
            # Run prediction
            results = self.model.predict(
                source=image_path,
                conf=conf_threshold,
                iou=iou_threshold,
                save=False,
                verbose=False
            )
            
            # Process results
            result = results[0]
            detections = []
            detected_classes = set()
            
            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls)
                    class_name = self.model.names[class_id]
                    confidence = float(box.conf)
                    
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    detection = {
                        'class_id': class_id,
                        'class_name': class_name,
                        'confidence': confidence,
                        'bbox': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2)
                        }
                    }
                    
                    detections.append(detection)
                    detected_classes.add(class_name)
            
            return {
                'success': True,
                'image_path': image_path,
                'detections': detections,
                'detected_classes': list(detected_classes),
                'total_detections': len(detections),
                'model_path': self.model_path
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'image_path': image_path
            }
    
    def predict_multiple_images(self, image_paths: List[str], conf_threshold: float = 0.7, iou_threshold: float = 0.3) -> Dict[str, Any]:
        """
        Run prediction on multiple images
        
        Args:
            image_paths: List of paths to image files
            conf_threshold: Confidence threshold for detections
            iou_threshold: IoU threshold for NMS
            
        Returns:
            Dictionary containing results for all images
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        try:
            # Run prediction on all images
            results = self.model.predict(
                source=image_paths,
                conf=conf_threshold,
                iou=iou_threshold,
                save=False,
                verbose=False
            )
            
            all_results = []
            all_detected_classes = set()
            total_detections = 0
            
            for i, result in enumerate(results):
                image_path = image_paths[i]
                detections = []
                detected_classes = set()
                
                if result.boxes is not None:
                    for box in result.boxes:
                        class_id = int(box.cls)
                        class_name = self.model.names[class_id]
                        confidence = float(box.conf)
                        
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        
                        detection = {
                            'class_id': class_id,
                            'class_name': class_name,
                            'confidence': confidence,
                            'bbox': {
                                'x1': float(x1),
                                'y1': float(y1),
                                'x2': float(x2),
                                'y2': float(y2)
                            }
                        }
                        
                        detections.append(detection)
                        detected_classes.add(class_name)
                        all_detected_classes.add(class_name)
                        total_detections += 1
                
                image_result = {
                    'image_path': image_path,
                    'detections': detections,
                    'detected_classes': list(detected_classes),
                    'detection_count': len(detections)
                }
                
                all_results.append(image_result)
            
            return {
                'success': True,
                'results': all_results,
                'all_detected_classes': list(all_detected_classes),
                'total_images': len(image_paths),
                'total_detections': total_detections,
                'model_path': self.model_path
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'image_paths': image_paths
            }

def main():
    """Main function for testing the integration"""
    # Initialize the integration
    yolo = YOLOIntegration()
    
    # Test with sample images (you can modify these paths)
    test_images = [
        "C:/Users/jedna/Downloads/Awesome-Raspberry-1221x1080.jpg", 
        "C:/Users/jedna/Downloads/Raspberry.webp", 
        "C:/Users/jedna/Downloads/Banana.jpg"
    ]
    
    # Filter existing images
    existing_images = [img for img in test_images if os.path.exists(img)]
    
    if existing_images:
        print(f"Testing with {len(existing_images)} images...")
        results = yolo.predict_multiple_images(existing_images)
        print(json.dumps(results, indent=2))
    else:
        print("No test images found. Please check the image paths.")

if __name__ == "__main__":
    main()

