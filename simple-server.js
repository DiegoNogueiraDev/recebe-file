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
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, `${timestamp}-${originalName}`);
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nenhum arquivo foi enviado' 
        });
    }

    const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        uploadTime: new Date().toISOString()
    };

    console.log(`Arquivo recebido: ${fileInfo.originalName} (${(fileInfo.size / 1024 / 1024).toFixed(2)} MB)`);

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
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Limite máximo: 500MB'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
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