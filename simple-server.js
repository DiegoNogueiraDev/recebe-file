const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Generate random port between 20000-65535
function generateRandomPort() {
    return Math.floor(Math.random() * (65535 - 20000 + 1)) + 20000;
}

let PORT = process.env.PORT || generateRandomPort();

// Check if port is available and find an alternative if not
function checkPortAvailable(port) {
    return new Promise((resolve) => {
        const server = require('net').createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

const uploadsDir = path.join(__dirname, 'shared-files');
console.log('📁 Upload directory:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating upload directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Upload directory created');
} else {
    console.log('✅ Upload directory exists');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📁 Multer destination called');
        console.log('Upload directory:', uploadsDir);
        console.log('Directory exists:', fs.existsSync(uploadsDir));
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        console.log('📝 Multer filename called');
        console.log('Original filename:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File encoding:', file.encoding);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const newFilename = `${timestamp}-${originalName}`;
        
        console.log('Generated filename:', newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

app.use(express.static('public'));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple.html'));
});

// Upload endpoint
app.post('/upload', (req, res, next) => {
    console.log('\n=== UPLOAD REQUEST RECEIVED ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Raw body exists:', !!req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    // Log before multer processing
    console.log('Processing with multer...');
    next();
}, upload.single('file'), (req, res) => {
    console.log('\n=== AFTER MULTER PROCESSING ===');
    console.log('req.file exists:', !!req.file);
    console.log('req.files exists:', !!req.files);
    console.log('req.body after multer:', req.body);
    
    if (req.file) {
        console.log('File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
    } else {
        console.log('❌ NO FILE RECEIVED');
        console.log('Available form fields:', Object.keys(req.body || {}));
        console.log('Raw request details:');
        console.log('- Method:', req.method);
        console.log('- URL:', req.url);
        console.log('- Content-Type:', req.headers['content-type']);
        console.log('- Content-Length:', req.headers['content-length']);
    }
    
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nenhum arquivo foi enviado',
            debug: {
                contentType: req.headers['content-type'],
                contentLength: req.headers['content-length'],
                bodyKeys: Object.keys(req.body || {}),
                hasFiles: !!req.files
            }
        });
    }

    const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        uploadTime: new Date().toISOString()
    };

    console.log(`✅ Arquivo recebido: ${fileInfo.originalName} (${(fileInfo.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`✅ Salvo como: ${fileInfo.filename}`);
    console.log(`✅ Localização: ${uploadsDir}/${fileInfo.filename}`);
    console.log('=================================\n');

    res.json({
        success: true,
        message: 'Arquivo enviado com sucesso!',
        file: fileInfo
    });
});

// List files endpoint
app.get('/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir).map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename: filename,
                originalName: filename.substring(filename.indexOf('-') + 1),
                size: stats.size,
                uploadTime: stats.mtime.toISOString(),
                sizeFormatted: (stats.size / 1024 / 1024).toFixed(2) + ' MB'
            };
        });

        res.json({ files });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar arquivos' 
        });
    }
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'Arquivo não encontrado'
        });
    }

    const originalName = filename.substring(filename.indexOf('-') + 1);
    res.download(filePath, originalName, (err) => {
        if (err) {
            console.error('Erro no download:', err);
        } else {
            console.log(`Download realizado: ${originalName}`);
        }
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.log('\n❌ ERROR CAUGHT:');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    
    if (error instanceof multer.MulterError) {
        console.log('Multer error code:', error.code);
        console.log('Multer error field:', error.field);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Limite máximo: 500MB',
                debug: {
                    errorCode: error.code,
                    limit: '500MB'
                }
            });
        }
        
        return res.status(400).json({
            success: false,
            message: `Erro de upload: ${error.message}`,
            debug: {
                errorCode: error.code,
                field: error.field
            }
        });
    }

    console.log('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        debug: {
            error: error.message
        }
    });
});

// Start server function
async function startServer() {
    // Check if port is available
    let portAvailable = await checkPortAvailable(PORT);
    while (!portAvailable) {
        PORT = generateRandomPort();
        portAvailable = await checkPortAvailable(PORT);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log('\n=== COMPARTILHAMENTO DE ARQUIVOS ===');
        console.log(`🌐 Servidor: http://localhost:${PORT}`);
        console.log(`📁 Pasta compartilhada: ${uploadsDir}`);
        console.log('====================================\n');
        
        // Save port info to file
        fs.writeFileSync('.port', `${PORT}`);
        
        // Get local network IP
        const os = require('os');
        const interfaces = os.networkInterfaces();
        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    console.log(`🌐 Acesso pela rede: http://${alias.address}:${PORT}`);
                }
            }
        }
        console.log('');
    });
}

// Start the server
startServer().catch(error => {
    console.error('Falha ao iniciar servidor:', error);
    process.exit(1);
});