# Forked
An AI-powered website that scans fridge or ingredient images to suggest goal-aligned meals. Helping users eat smarter based on their fitness and nutrition targets.
Using a custom-trained local object detection model, the website provides an intuitive interface for users to upload multiple images and preview them, returning a unique list of ingredients. **Full deployment now live on Hugging Face**

## Features

-  **Mobile-Responsive Design**: Optimized for both desktop and mobile devices
-  **Multiple Image Upload**: Support for uploading multiple images at once
-  **Modern UI**: Clean, intuitive interface with drag-and-drop functionality
-  **Progress Tracking**: Real-time upload progress indicators
-  **Image Management**: Preview, remove individual images, or clear all
-  **File Processing**: Automatic image resizing and optimization
-  **File Path Storage**: Maintains a list of uploaded file paths for your model
-  **AI Recipe Generation**: Automatically generates recipes from detected ingredients using the deepseek-r1 LLM on Ollama

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Python 3.7+ (for YOLO API server and recipe generation)
- Ollama installed and running locally (for recipe generation)
- An Ollama model installed (e.g., `deepseek-r1`, or `qwen3`)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd .\food-detection-upload
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## File Structure

```
C:\Users\jedna\food-detection-upload\
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies
├── uploads/            # Directory for uploaded images (created automatically)
└── README.md           # This file
```

## API Endpoints

### Upload Image
- **POST** `/api/upload`
- **Body**: FormData with image file
- **Response**: JSON with file information

### Get All Files
- **GET** `/api/files`
- **Response**: JSON array of all uploaded files

### Get Specific File
- **GET** `/api/files/:id`
- **Response**: JSON with specific file information

### Delete File
- **DELETE** `/api/files/:id`
- **Response**: JSON confirmation

### Clear All Files
- **DELETE** `/api/files`
- **Response**: JSON confirmation

### Health Check
- **GET** `/api/health`
- **Response**: Server status and file count

### Generate Recipes
- **POST** `/api/generate-recipes`
- **Body**: JSON with `ingredients` array and optional `num_recipes` (default: 3)
- **Response**: JSON with generated recipes from Ollama LLM

### Check Ollama Health
- **GET** `/api/ollama-health`
- **Response**: Ollama availability and model information

## Integration with Object Detection Model

The uploaded images are stored in the `uploads/` directory with unique filenames. The file paths are maintained in the server's memory and can be accessed via the API endpoints.

## Recipe Generation with Ollama

After detecting ingredients in uploaded images, the system automatically generates recipe suggestions using a local Ollama LLM.

### Setup Ollama

1. **Install Ollama**: Download and install from [ollama.ai](https://ollama.ai)

2. **Pull a model** (choose one):
   ```bash
   ollama pull deepseek-r1:8b
   # or
   ollama pull qwen3:8b
   # or
   ollama pull llama3
   ```

3. **Start Ollama** (if not running as a service):
   ```bash
   ollama serve
   ```

### Configuration

The recipe generator uses environment variables for configuration:

- `OLLAMA_URL`: Ollama API URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model name to use (default: `deepseek-r1`)

Set these in your environment or modify `yolo_api_server.py`:

```python
ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
ollama_model = os.getenv('OLLAMA_MODEL', 'deepseek-r1')
```

### How It Works

1. User uploads food images
2. YOLO model detects ingredients in the images
3. Unique ingredients are extracted from detections
4. Ingredients are sent to Ollama with a recipe generation prompt
5. Generated recipes are displayed on the website

### Python Dependencies

Install Python dependencies for the YOLO API server:

```bash
pip install -r requirements.txt
```

This includes:
- `ultralytics` - YOLO model
- `flask` - API server
- `requests` - Ollama API communication
- Other dependencies

### Example Integration

```javascript
// Get all uploaded file paths
fetch('/api/files')
  .then(response => response.json())
  .then(data => {
    const filePaths = data.files.map(file => file.filePath);
    // Send filePaths to your object detection model
    processImagesWithModel(filePaths);
  });
```

## Configuration

### File Upload Limits
- Maximum file size: 10MB
- Supported formats: JPEG, JPG, PNG, GIF, WebP
- Images are automatically resized to max 800px width

### Server Configuration
- Default port: 3000
- Upload directory: `./uploads/`
- CORS enabled for cross-origin requests

## Customization

### Styling
Edit `styles.css` to customize the appearance:
- Colors and gradients
- Layout and spacing
- Mobile breakpoints
- Animation effects

### Functionality
Modify `script.js` to add features:
- Additional file validation
- Custom image processing
- Integration with external APIs
- Enhanced error handling

### Backend
Update `server.js` to:
- Add authentication
- Implement database storage
- Add file compression
- Integrate with your object detection model

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in `server.js` or set environment variable
   - Kill existing process using the port

2. **File upload fails**
   - Check file size (max 10MB)
   - Verify file format is supported
   - Ensure the uploads directory has write permissions

3. **Images not displaying**
   - Check browser console for errors
   - Verify file paths are correct
   - Ensure images are valid format

4. **Recipe generation fails**
   - Ensure Ollama is running: `ollama serve`
   - Verify the model is installed: `ollama list`
   - Check Ollama health: `GET /api/ollama-health`
   - Verify Ollama URL and model name in configuration

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=* npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the browser console for errors
3. Check server logs for backend issues
4. Create an issue with detailed information


Google Docs and Slides:
https://docs.google.com/document/d/15PTmDw7WNkGvc0azn3gvAa9ViHw1OwzMhMzYFJIEn70/edit?tab=t.0
