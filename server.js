const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');
const winston = require('winston');

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

// Logger configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'server.log' }),
        new winston.transports.Console()
    ]
});

// Authentication token storage (in production, use Redis or database)
const validTokens = new Set();
const ACCESS_TOKEN = uuidv4();
validTokens.add(ACCESS_TOKEN);

// Generate SSL certificate if not exists
function generateSSLCertificate() {
    const certPath = path.join(__dirname, 'server.crt');
    const keyPath = path.join(__dirname, 'server.key');
    
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        const { execSync } = require('child_process');
        try {
            execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
            logger.info('SSL certificate generated successfully');
        } catch (error) {
            logger.warn('Could not generate SSL certificate. Using HTTP mode.');
            return null;
        }
    }
    
    try {
        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
    } catch (error) {
        logger.warn('Could not read SSL certificate. Using HTTP mode.');
        return null;
    }
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        },
    },
}));

// Rate limiting
const uploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    message: {
        success: false,
        message: 'Muitas tentativas de upload. Tente novamente em 15 minutos.'
    }
});

// Session configuration
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Will be set to true for HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] || req.query.token || req.session.token;
    
    if (!token || !validTokens.has(token.replace('Bearer ', ''))) {
        return res.status(401).json({
            success: false,
            message: 'Token de acesso inválido ou ausente'
        });
    }
    
    req.session.authenticated = true;
    req.session.token = token.replace('Bearer ', '');
    next();
}

// File hash generation
function generateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // Sanitize filename to prevent path traversal
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}-${sanitizedName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos compactados são permitidos (.zip, .rar, .7z, .tar, .gz, .bz2, .xz)'));
        }
    }
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth endpoint to get access token
app.post('/auth', (req, res) => {
    const { password } = req.body;
    const SERVER_PASSWORD = process.env.SERVER_PASSWORD || 'securepass123';
    
    if (password === SERVER_PASSWORD) {
        req.session.authenticated = true;
        req.session.token = ACCESS_TOKEN;
        res.json({
            success: true,
            token: ACCESS_TOKEN,
            message: 'Autenticado com sucesso'
        });
        logger.info(`Successful authentication from IP: ${req.ip}`);
    } else {
        res.status(401).json({
            success: false,
            message: 'Senha incorreta'
        });
        logger.warn(`Failed authentication attempt from IP: ${req.ip}`);
    }
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString(),
        authenticated: !!req.session.authenticated
    });
});

app.post('/upload', uploadLimit, authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nenhum arquivo foi enviado' 
        });
    }

    // Generate file hash for integrity verification
    const fileHash = generateFileHash(req.file.path);
    
    const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        path: req.file.path,
        uploadTime: new Date().toISOString(),
        hash: fileHash
    };

    logger.info('File received', {
        originalName: fileInfo.originalName,
        filename: fileInfo.filename,
        size: `${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`,
        hash: fileHash,
        ip: req.ip
    });

    res.json({
        success: true,
        message: 'Arquivo enviado com sucesso!',
        file: fileInfo
    });
});

app.get('/files', authenticateToken, (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir).map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            const fileHash = generateFileHash(filePath);
            return {
                filename: filename,
                size: stats.size,
                uploadTime: stats.mtime.toISOString(),
                sizeFormatted: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                hash: fileHash
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

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Limite máximo: 100MB'
            });
        }
    }

    if (error.message.includes('Apenas arquivos compactados')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Start server function with HTTPS support
async function startServer() {
    // Check if port is available
    let portAvailable = await checkPortAvailable(PORT);
    while (!portAvailable) {
        PORT = generateRandomPort();
        portAvailable = await checkPortAvailable(PORT);
    }
    
    // Generate SSL certificate
    const sslOptions = generateSSLCertificate();
    
    if (sslOptions) {
        // HTTPS Server
        app.use(session({
            secret: crypto.randomBytes(32).toString('hex'),
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: true, // HTTPS
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            }
        }));
        
        const httpsServer = https.createServer(sslOptions, app);
        httpsServer.listen(PORT, '0.0.0.0', () => {
            logger.info(`HTTPS Server running on https://localhost:${PORT}`);
            logger.info(`Files will be saved in: ${uploadsDir}`);
            logger.info(`Access Token: ${ACCESS_TOKEN}`);
            logger.info(`Server Password: ${process.env.SERVER_PASSWORD || 'securepass123'}`);
            
            // Save port info to file
            fs.writeFileSync('.port', `${PORT}`);
            fs.writeFileSync('.token', ACCESS_TOKEN);
            
            console.log('\n=== SECURE FILE UPLOAD SERVER ===');
            console.log(`🔒 HTTPS Server: https://localhost:${PORT}`);
            console.log(`🔑 Access Token: ${ACCESS_TOKEN}`);
            console.log(`🔐 Password: ${process.env.SERVER_PASSWORD || 'securepass123'}`);
            console.log(`📁 Upload Directory: ${uploadsDir}`);
            console.log('================================\n');
        });
    } else {
        // HTTP Server (fallback)
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`HTTP Server running on http://localhost:${PORT}`);
            logger.info(`Files will be saved in: ${uploadsDir}`);
            logger.info(`Access Token: ${ACCESS_TOKEN}`);
            logger.warn('Running in HTTP mode - consider installing OpenSSL for HTTPS');
            
            // Save port info to file
            fs.writeFileSync('.port', `${PORT}`);
            fs.writeFileSync('.token', ACCESS_TOKEN);
            
            console.log('\n=== FILE UPLOAD SERVER (HTTP) ===');
            console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
            console.log(`🔑 Access Token: ${ACCESS_TOKEN}`);
            console.log(`🔐 Password: ${process.env.SERVER_PASSWORD || 'securepass123'}`);
            console.log(`📁 Upload Directory: ${uploadsDir}`);
            console.log('==================================\n');
        });
    }
}

// Start the server
startServer().catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});