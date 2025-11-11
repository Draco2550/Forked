# YOLOv11n Integration Setup Guide

This guide will help you set up the food detection upload website with your YOLOv11n model.

## Project Structure

```
G:\YOLOv8\
├── Project\
│   └── ingredient_dection.py          # Your existing YOLOv11n model
├── runs\train\exp2\weights\
│   └── best.pt                        # Your trained model weights
├── food-detection-upload\             # Web interface
│   ├── index.html                     # Frontend
│   ├── styles.css                     # Styling
│   ├── script.js                      # Frontend logic
│   ├── server.js                      # Node.js backend
│   ├── package.json                   # Node.js dependencies
│   ├── yolo_integration.py            # YOLO wrapper
│   ├── yolo_api_server.py             # Python API server
│   ├── requirements.txt               # Python dependencies
│   ├── start_servers.bat              # Startup script
│   └── uploads\                       # Uploaded images (auto-created)
```

## Quick Start
 Files Created in G:\YOLOv8\food-detection-upload`:** 1. **yolo_integration.py** - Python wrapper for your YOLOv11n model 2. **yolo_api_server.py** - Flask API server that runs your model 3. **Updated server.js** - Node.js server with YOLO integration endpoints 4. **Updated script.js** - Frontend with detection results display 5. **Updated styles.css** - Styling for detection results 6. **requirements.txt** - Python dependencies 7. **start_servers.bat** - Automated startup script 8. **SETUP_GUIDE.md** - Comprehensive setup instructions ## 🚀 **How to Run the Complete System** ### **Option 1: Automated (Easiest)** ``bash cd G:\YOLOv8\food-detection-upload start_servers.bat

### Option 1: Automated Setup (Recommended)
1. Navigate to the project folder:
   ```bash
   cd G:\YOLOv8\food-detection-upload
   ```

2. Run the startup script:
   ```bash
   start_servers.bat
   ```

This will automatically install dependencies and start both servers.

### Option 2: Manual Setup

#### Step 1: Install Node.js Dependencies
```bash
cd G:\YOLOv8\food-detection-upload
npm install
```

#### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Step 3: Start YOLO API Server (Terminal 1)
```bash
python yolo_api_server.py
```

#### Step 4: Start Web Server (Terminal 2)
```bash
npm start
```

## Access the Application

- **Web Interface**: http://localhost:3000
- **YOLO API**: http://localhost:5000

## Configuration

### Model Path Configuration
The system will automatically look for your model in this order:
1. `runs/train/exp2/weights/best.pt` (your trained model)
2. `../runs/train/exp2/weights/best.pt` (relative path)
3. `../../runs/train/exp2/weights/best.pt` (two levels up)
4. `yolo11n.pt` (fallback to YOLOv11n)

### Customizing Detection Parameters
Edit `server.js` to modify detection parameters:
```javascript
const yoloResponse = await axios.post(`${YOLO_API_URL}/predict_batch`, {
    image_paths: filePaths,
    conf_threshold: 0.7,    // Confidence threshold
    iou_threshold: 0.3      // IoU threshold for NMS
});
```

## How It Works

1. **Image Upload**: Users upload food images through the web interface
2. **File Storage**: Images are saved to the `uploads/` directory
3. **YOLO Processing**: The Python API server runs your YOLOv11n model
4. **Results Display**: Detection results are shown in the web interface

## API Endpoints

### Web Server (Node.js - Port 3000)
- `POST /api/upload` - Upload images
- `POST /api/process` - Process images with YOLO
- `GET /api/files` - Get uploaded files list
- `GET /api/model-info` - Get model information
- `GET /api/yolo-health` - Check YOLO API health

### YOLO API Server (Python - Port 5000)
- `POST /predict` - Predict single image
- `POST /predict_batch` - Predict multiple images
- `GET /model_info` - Get model information
- `GET /health` - Health check

## Troubleshooting

### Common Issues

1. **"YOLO API not available"**
   - Make sure the Python server is running on port 5000
   - Check if all Python dependencies are installed

2. **"Model file not found"**
   - Verify your model path in `yolo_integration.py`
   - Check if `best.pt` exists in the expected location

3. **Port already in use**
   - Change ports in `server.js` (PORT) and `yolo_api_server.py` (port)
   - Kill existing processes using the ports

4. **Images not displaying**
   - Check browser console for errors
   - Verify file upload permissions

### Debug Mode

Enable detailed logging:
```bash
# Node.js server
DEBUG=* npm start

# Python server
python yolo_api_server.py
```

## 🔄 Integration with Your Existing Code

Your existing `ingredient_dection.py` can be integrated by:

1. **Import the integration module**:
   ```python
   from yolo_integration import YOLOIntegration
   ```

2. **Use the wrapper**:
   ```python
   yolo = YOLOIntegration('runs/train/exp2/weights/best.pt')
   results = yolo.predict_image('path/to/image.jpg')
   ```

## Performance Tips

1. **GPU Acceleration**: Ensure CUDA is properly configured for faster inference
2. **Batch Processing**: The system processes multiple images efficiently
3. **Image Resizing**: Images are automatically resized to 800px max width for faster processing

## Customization

### Adding New Features
- **Frontend**: Edit `script.js` and `styles.css`
- **Backend**: Modify `server.js` for new API endpoints
- **YOLO Integration**: Update `yolo_integration.py` for model-specific features

### Styling
- Edit `styles.css` to match your brand
- Modify colors, fonts, and layout as needed

## Support

If you encounter issues:
1. Check the console logs for both servers
2. Verify all dependencies are installed
3. Ensure your model file exists and is accessible
4. Check that ports 3000 and 5000 are available

## Next Steps

1. Test the integration with sample images
2. Customize the detection parameters for your use case
3. Add additional features like result export or batch processing
4. Deploy to a production environment if needed

