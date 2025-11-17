#!/usr/bin/env python3
"""
YOLO Environment Validation Script
Run this before starting the API server to ensure everything is correctly installed.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path
import importlib.util
import requests

BASE_DIR = Path(__file__).resolve().parent

# Utility: Colors for output
class Color:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    END = "\033[0m"

def ok(message):
    print(f"{Color.GREEN}[OK] {message}{Color.END}")

def fail(message):
    print(f"{Color.RED}[FAIL] {message}{Color.END}")

def warn(message):
    print(f"{Color.YELLOW}[WARN] {message}{Color.END}")

def info(message):
    print(f"{Color.CYAN}[INFO] {message}{Color.END}")


# Helper functions
def check_python_version():
    info("Checking Python version...")
    if sys.version_info < (3, 9):
        fail("Python 3.9+ is required.")
    else:
        ok(f"Python version: {platform.python_version()}")

def check_package(package):
    info(f"Checking package: {package}...")
    spec = importlib.util.find_spec(package)
    if spec is None:
        fail(f"Package '{package}' is NOT installed.")
        return False
    ok(f"Package '{package}' is installed.")
    return True

def check_dependencies():
    required = [
        "flask",
        "flask_cors",
        "torch",
        "ultralytics",
        "requests"
    ]
    for pkg in required:
        check_package(pkg)

def check_gpu():
    info("Checking GPU availability...")
    try:
        import torch
        if torch.cuda.is_available():
            ok(f"GPU available: {torch.cuda.get_device_name(0)}")
        else:
            warn("GPU NOT available — using CPU only.")
    except Exception as e:
        fail(f"Error checking GPU: {e}")

def check_model_files():
    info("Checking YOLO model files...")
    model_paths = [
        BASE_DIR / "exp2/weights/best.pt",
        BASE_DIR.parent / "exp2/weights/best.pt",
        BASE_DIR.parent.parent / "runs/train/exp2/weights/best.pt",
        BASE_DIR / "yolo11n.pt"
    ]

    found = False
    for path in model_paths:
        if path.exists():
            ok(f"Found model: {path}")
            found = True

    if not found:
        fail("NO YOLO model found. Server will not function until a model is present.")

def check_yolo_integration():
    info("Checking yolo_integration.py...")
    yi = BASE_DIR / "yolo_integration.py"
    if not yi.exists():
        fail(f"Missing file: {yi}")
    else:
        ok(f"Found yolo_integration.py at {yi}")

def check_flask_running():
    info("Checking if Flask server is running at http://127.0.0.1:5000/health ...")
    try:
        response = requests.get("http://127.0.0.1:5000/health", timeout=1)
        if response.status_code == 200:
            ok("Flask API is running and reachable.")
            print(response.json())
        else:
            fail(f"Flask responded with status {response.status_code}")
    except Exception:
        warn("Flask API is NOT running. Start it with: python server.py")

def check_write_permissions():
    info("Checking write permissions to project directory...")
    test_file = BASE_DIR / "write_test.tmp"

    try:
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        ok("Write permission OK.")
    except Exception as e:
        fail(f"No write permission: {e}")

def check_pip_packages_versions():
    info("Checking package versions...")
    try:
        import torch
        import ultralytics

        ok(f"Torch version: {torch.__version__}")
        ok(f"Ultralytics version: {ultralytics.__version__}")
    except Exception as e:
        fail(f"Could not retrieve versions: {e}")


# Main validation routine

def main():
    print("\n=== YOLO ENVIRONMENT VALIDATION ===\n")

    check_python_version()
    print()

    check_dependencies()
    print()

    check_gpu()
    print()

    check_model_files()
    print()

    check_yolo_integration()
    print()

    check_write_permissions()
    print()

    check_pip_packages_versions()
    print()

    check_flask_running()
    print()

    print("\n=== VALIDATION COMPLETE ===\n")


if __name__ == "__main__":
    main()
