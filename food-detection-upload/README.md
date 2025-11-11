# Food Detection Image Upload Website

A mobile-responsive website for uploading food images to a locally hosted object detection model. The website provides an intuitive interface for users to upload multiple images, preview them, and send them to your local object detection model.

## Features

- 📱 **Mobile-Responsive Design**: Optimized for both desktop and mobile devices
- 🖼️ **Multiple Image Upload**: Support for uploading multiple images at once
- 🎨 **Modern UI**: Clean, intuitive interface with drag-and-drop functionality
- 📊 **Progress Tracking**: Real-time upload progress indicators
- 🗂️ **Image Management**: Preview, remove individual images, or clear all
- 🔄 **File Processing**: Automatic image resizing and optimization
- 📁 **File Path Storage**: Maintains a list of uploaded file paths for your model

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd C:\Users\jedna\food-detection-upload
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

## Integration with Object Detection Model

The uploaded images are stored in the `uploads/` directory with unique filenames. The file paths are maintained in the server's memory and can be accessed via the API endpoints.

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
   - Ensure uploads directory has write permissions

3. **Images not displaying**
   - Check browser console for errors
   - Verify file paths are correct
   - Ensure images are valid format

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=* npm start
```

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check server logs for backend issues
4. Create an issue with detailed information
