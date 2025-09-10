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

// Allowed compressed file types
const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-gzip',
    'application/octet-stream' // Generic binary file type (relies on extension validation)
];

const allowedExtensions = ['.zip', '.7z', '.rar', '.tar', '.gz', '.tar.gz'];

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

// File filter for security validation
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    // Check file extension
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
    
    // Check MIME type
    if (!allowedMimeTypes.includes(mimeType)) {
        return cb(new Error('Invalid file format detected'), false);
    }
    
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
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
                message: 'File too large. Maximum size is 100MB'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
    }
    
    if (error.message.includes('File type not allowed') || error.message.includes('Invalid file format')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
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

// Start server
app.listen(PORT, () => {
    console.log(`File upload server running on port ${PORT}`);
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Allowed file types: ${allowedExtensions.join(', ')}`);
});