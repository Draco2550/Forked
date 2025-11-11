class ImageUploadManager {
    constructor() {
        this.uploadedImages = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.imagesGrid = document.getElementById('imagesGrid');
        this.imageCount = document.getElementById('imageCount');
        this.processBtn = document.getElementById('processBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.statusMessage = document.getElementById('statusMessage');
    }

    attachEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Action buttons
        this.processBtn.addEventListener('click', () => {
            this.processImages();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearAllImages();
        });
    }

    handleFiles(files) {
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;

        this.showProgress();
        this.uploadFiles(validFiles);
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            this.showStatus(`File ${file.name} is not a supported image format`, 'error');
            return false;
        }

        if (file.size > this.maxFileSize) {
            this.showStatus(`File ${file.name} is too large. Maximum size is 10MB`, 'error');
            return false;
        }

        return true;
    }

    async uploadFiles(files) {
        const totalFiles = files.length;
        let uploadedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                const imageData = await this.processImageFile(file);
                this.uploadedImages.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    data: imageData,
                    uploadedAt: new Date()
                });

                uploadedCount++;
                this.updateProgress((uploadedCount / totalFiles) * 100);
                
            } catch (error) {
                console.error('Error processing file:', error);
                this.showStatus(`Error processing ${file.name}`, 'error');
            }
        }

        this.hideProgress();
        this.updateImageGrid();
        this.updateButtons();
        this.showStatus(`Successfully uploaded ${uploadedCount} image(s)`, 'success');
    }

    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create a canvas to resize the image if needed
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Resize image to max 800px width while maintaining aspect ratio
                    const maxWidth = 800;
                    const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Convert to blob for upload
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, file.type, 0.8);
                };
                
                img.onerror = () => reject(new Error('Invalid image file'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    updateImageGrid() {
        if (this.uploadedImages.length === 0) {
            this.imagesGrid.innerHTML = `
                <div class="no-images">
                    <i class="fas fa-image"></i>
                    <p>No images uploaded yet</p>
                </div>
            `;
            return;
        }

        this.imagesGrid.innerHTML = this.uploadedImages.map(image => `
            <div class="image-item">
                <img src="${URL.createObjectURL(image.data)}" alt="${image.name}">
                <button class="remove-btn" onclick="imageManager.removeImage('${image.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-info">
                    <div class="image-name" title="${image.name}">${image.name}</div>
                    <div class="image-size">${image.size}</div>
                </div>
            </div>
        `).join('');
    }

    removeImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
        this.updateImageGrid();
        this.updateButtons();
        this.showStatus('Image removed', 'info');
    }

    clearAllImages() {
        this.uploadedImages = [];
        this.updateImageGrid();
        this.updateButtons();
        this.showStatus('All images cleared', 'info');
    }

    updateButtons() {
        const hasImages = this.uploadedImages.length > 0;
        this.processBtn.disabled = !hasImages;
        this.clearBtn.disabled = !hasImages;
        this.imageCount.textContent = `${this.uploadedImages.length} image${this.uploadedImages.length !== 1 ? 's' : ''}`;
    }

    showProgress() {
        this.progressContainer.style.display = 'flex';
        this.updateProgress(0);
    }

    hideProgress() {
        setTimeout(() => {
            this.progressContainer.style.display = 'none';
        }, 1000);
    }

    updateProgress(percentage) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
    }

    async processImages() {
        if (this.uploadedImages.length === 0) return;

        this.showStatus('Processing images...', 'info');
        this.processBtn.disabled = true;

        try {
            // First upload all images
            const formDataArray = this.uploadedImages.map(image => {
                const formData = new FormData();
                formData.append('image', image.data, image.name);
                return formData;
            });

            // Upload images to backend
            const uploadResponses = await Promise.all(
                formDataArray.map(formData => 
                    fetch('http://localhost:3000/api/upload', {
                        method: 'POST',
                        body: formData
                    })
                )
            );

            const uploadResults = await Promise.all(
                uploadResponses.map(response => response.json())
            );

            // Check if all uploads were successful
            const allUploadsSuccessful = uploadResults.every(result => result.success);
            
            if (!allUploadsSuccessful) {
                this.showStatus('Some images failed to upload', 'error');
                return;
            }

            // Now process with YOLO model
            this.showStatus('Running object detection...', 'info');
            
            const processResponse = await fetch('http://localhost:3000/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const processResult = await processResponse.json();

            if (processResult.success) {
                this.displayDetectionResults(processResult);
                this.showStatus(`Detection complete! Found ${processResult.summary.total_detections} objects`, 'success');
            } else {
                this.showStatus('Object detection failed: ' + processResult.message, 'error');
            }

        } catch (error) {
            console.error('Error processing images:', error);
            this.showStatus('Error processing images. Please try again.', 'error');
        } finally {
            this.processBtn.disabled = false;
        }
    }

    displayDetectionResults(result) {
        // Update the image grid to show detection results
        this.imagesGrid.innerHTML = result.results.map(imageResult => {
            const detections = imageResult.detections || [];
            const detectedClasses = imageResult.detected_classes || [];
            
            return `
                <div class="image-item">
                    <img src="${URL.createObjectURL(this.uploadedImages.find(img => img.name === imageResult.originalName)?.data)}" alt="${imageResult.originalName}">
                    <button class="remove-btn" onclick="imageManager.removeImage('${this.uploadedImages.find(img => img.name === imageResult.originalName)?.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-info">
                        <div class="image-name" title="${imageResult.originalName}">${imageResult.originalName}</div>
                        <div class="image-size">${this.formatFileSize(imageResult.size)}</div>
                        <div class="detection-results">
                            <div class="detection-count">${detections.length} detection${detections.length !== 1 ? 's' : ''}</div>
                            <div class="detected-classes">${detectedClasses.join(', ') || 'No objects detected'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Show summary
        this.showDetectionSummary(result.summary);
    }

    showDetectionSummary(summary) {
        const summaryHtml = `
            <div class="detection-summary">
                <h3><i class="fas fa-chart-bar"></i> Detection Summary</h3>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-label">Images Processed:</span>
                        <span class="stat-value">${summary.total_images}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Detections:</span>
                        <span class="stat-value">${summary.total_detections}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Classes Found:</span>
                        <span class="stat-value">${summary.all_detected_classes.length}</span>
                    </div>
                </div>
                <div class="detected-classes-list">
                    <strong>Detected Classes:</strong>
                    ${summary.all_detected_classes.length > 0 ? 
                        summary.all_detected_classes.map(cls => `<span class="class-tag">${cls}</span>`).join('') : 
                        '<span class="no-detections">No objects detected</span>'
                    }
                </div>
            </div>
        `;

        // Insert summary after the images section
        const imagesSection = document.querySelector('.images-section');
        const existingSummary = document.querySelector('.detection-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        imagesSection.insertAdjacentHTML('afterend', summaryHtml);
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.classList.add('show');

        setTimeout(() => {
            this.statusMessage.classList.remove('show');
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the image upload manager when the page loads
let imageManager;
document.addEventListener('DOMContentLoaded', () => {
    imageManager = new ImageUploadManager();
});
