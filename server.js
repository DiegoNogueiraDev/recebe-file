const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 35678;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const originalName = file.originalname;
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const safeBaseName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${safeBaseName}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit
        files: 1 // Only one file at a time
    }
});

// Serve static files
app.use(express.static('public'));

// Upload endpoint
app.post('/upload', upload.single('compressedFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // File successfully uploaded
        res.json({
            success: true,
            message: 'File uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            uploadPath: req.file.path
        });

        // Log successful upload
        console.log(`File uploaded: ${req.file.originalname} → ${req.file.filename}`);
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during upload'
        });
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'File too large. Maximum size is 3GB'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
    }
    
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server with extended timeout for large files
const server = app.listen(PORT, () => {
    console.log(`File upload server running on port ${PORT}`);
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Max file size: 3GB`);
});

// Extend timeout to 30 minutes for large file uploads
server.timeout = 30 * 60 * 1000;
server.keepAliveTimeout = 30 * 60 * 1000;