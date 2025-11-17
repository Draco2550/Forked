const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
// const YOLO_API_URL = process.env.YOLO_API_URL || 'http://localhost:5000';
const YOLO_API_URL = process.env.YOLO_API_URL || 'http://127.0.0.1:5000';


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist (Already setup so don't worry.)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `food-image-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Store uploaded file paths
let uploadedFilePaths = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;

        // Add to uploaded files list
        uploadedFilePaths.push({
            id: Date.now() + Math.random(),
            fileName: fileName,
            originalName: originalName,
            filePath: filePath,
            size: fileSize,
            uploadedAt: new Date().toISOString()
        });

        console.log(`File uploaded: ${originalName} -> ${fileName}`);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileName: fileName,
                originalName: originalName,
                filePath: filePath,
                size: fileSize
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Get uploaded files list
app.get('/api/files', (req, res) => {
    res.json({
        success: true,
        files: uploadedFilePaths,
        count: uploadedFilePaths.length
    });
});

// Get specific file
app.get('/api/files/:id', (req, res) => {
    const fileId = req.params.id;
    const file = uploadedFilePaths.find(f => f.id == fileId);
    
    if (!file) {
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }

    res.json({
        success: true,
        file: file
    });
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
    const fileId = req.params.id;
    const fileIndex = uploadedFilePaths.findIndex(f => f.id == fileId);
    
    if (fileIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }

    const file = uploadedFilePaths[fileIndex];
    
    try {
        // Delete physical file
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }
        
        // Remove from array
        uploadedFilePaths.splice(fileIndex, 1);
        
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
});

// Clear all files (Might need to get check this or the one above for fixing the individual file deletion.)
app.delete('/api/files', (req, res) => {
    try {
        // Delete all physical files
        uploadedFilePaths.forEach(file => {
            if (fs.existsSync(file.filePath)) {
                fs.unlinkSync(file.filePath);
            }
        });
        
        // Clear array
        uploadedFilePaths = [];
        
        res.json({
            success: true,
            message: 'All files cleared successfully'
        });
        
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing files',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uploadedFiles: uploadedFilePaths.length
    });
});

// Process images with YOLO model
app.post('/api/process', async (req, res) => {
    try {
        if (uploadedFilePaths.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images to process'
            });
        }

        // Get file paths
        const filePaths = uploadedFilePaths.map(file => file.filePath);
        
        console.log(`Processing ${filePaths.length} images with YOLO model...`);

        // Call YOLO API
        const yoloResponse = await axios.post(`${YOLO_API_URL}/predict_batch`, {
            image_paths: filePaths,
            conf_threshold: 0.7,
            iou_threshold: 0.3
        });

        if (yoloResponse.data.success) {
            // Combine uploaded file info with detection results
            const results = yoloResponse.data.results.map((result, index) => ({
                ...uploadedFilePaths[index],
                detections: result.detections,
                detected_classes: result.detected_classes,
                detection_count: result.detection_count
            }));

            res.json({
                success: true,
                message: 'Images processed successfully',
                results: results,
                summary: {
                    total_images: yoloResponse.data.total_images,
                    total_detections: yoloResponse.data.total_detections,
                    all_detected_classes: yoloResponse.data.all_detected_classes
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'YOLO processing failed',
                error: yoloResponse.data.error
            });
        }

    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing images',
            error: error.message
        });
    } finally {
        try {
            uploadedFilePaths.forEach(file => {
                if (fs.existsSync(file.filePath)) {
                    fs.unlinkSync(file.filePath);
                }
            });
            uploadedFilePaths = [];
            console.log('🧹 Uploads directory cleared after processing');
        } catch (cleanupError) {
            console.error('Error clearing uploads directory:', cleanupError);
        }
    }
});

// Get YOLO model information
app.get('/api/model-info', async (req, res) => {
    try {
        const yoloResponse = await axios.get(`${YOLO_API_URL}/model_info`);
        res.json({
            success: true,
            model_info: yoloResponse.data
        });
    } catch (error) {
        console.error('Error getting model info:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting model information',
            error: error.message
        });
    }
});

// Check YOLO API health
app.get('/api/yolo-health', async (req, res) => {
    try {
        const yoloResponse = await axios.get(`${YOLO_API_URL}/health`);
        res.json({
            success: true,
            yolo_health: yoloResponse.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'YOLO API not available',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`📊 Uploaded files: ${uploadedFilePaths.length}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

module.exports = app;
