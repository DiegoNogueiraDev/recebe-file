# 🔒 Secure File Upload Server

A hardened Node.js file upload server with enterprise-grade security features, designed specifically for compressed/archive files with encrypted transfers and comprehensive audit logging.

## 🛡️ Security Features

### 🔐 **Authentication & Authorization**
- **Token-based authentication** with UUID tokens
- **Password-protected access** (configurable via environment)
- **Session management** with secure HTTP-only cookies
- **Rate limiting**: 10 uploads per 15 minutes per IP
- **Access logging** with Winston for security auditing

### 🔒 **HTTPS & SSL**
- **Automatic SSL certificate generation** (requires OpenSSL)
- **HTTPS by default** for encrypted file transfers
- **HTTP fallback** if SSL generation fails
- **Secure cookie configuration** for production

### 📁 **File Security**
- **SHA-256 hash generation** for file integrity verification
- **Filename sanitization** to prevent path traversal attacks
- **File type validation** for compressed formats only
- **100MB file size limit** with configurable restrictions
- **Timestamp-prefixed filenames** to prevent conflicts

### 🌐 **Network Security**
- **Random port selection** (20000-65535) on each startup
- **Port availability checking** with automatic fallback
- **Helmet.js security headers** (CSP, HSTS, X-Frame-Options)
- **CORS protection** with controlled access policies

### 📊 **Monitoring & Logging**
- **Comprehensive audit logging** with Winston
- **File operation tracking** with metadata
- **Security event monitoring** (failed auth attempts)
- **Structured JSON logging** for analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- OpenSSL (for HTTPS certificate generation)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd recebe-file

# Install security dependencies
npm install

# Start in development mode
npm run dev

# Or start in production mode
npm start
```

### First-Time Setup
1. The server will automatically generate a random port and SSL certificates
2. Check console output for:
   - **Server URL**: `https://localhost:PORT`
   - **Access Token**: Found in `.token` file
   - **Default Password**: `securepass123` (changeable via `SERVER_PASSWORD` env var)

## 📋 Configuration

### Environment Variables
```bash
# Override random port selection
PORT=8443

# Set custom authentication password
SERVER_PASSWORD=your_secure_password_here
```

### Security Configuration Points
- **File size limit**: `server.js:155` (100MB)
- **Allowed extensions**: `server.js:159` (compressed files only)
- **Upload directory**: `server.js:41` (`./uploads/`)
- **Rate limit**: `server.js:89` (15 min window, 10 uploads)
- **Session expiry**: `server.js:109` (24 hours)

## 🔌 API Endpoints

### Authentication
```bash
POST /auth
Content-Type: application/json

{
  "password": "securepass123"
}

# Response
{
  "success": true,
  "token": "uuid-token-here",
  "message": "Autenticado com sucesso"
}
```

### File Upload
```bash
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <compressed-file>

# Response
{
  "success": true,
  "message": "Arquivo enviado com sucesso!",
  "file": {
    "originalName": "archive.zip",
    "filename": "2024-01-01T12-00-00-000Z-archive.zip",
    "size": 1048576,
    "hash": "sha256-hash-here",
    "uploadTime": "2024-01-01T12:00:00.000Z"
  }
}
```

### File Listing
```bash
GET /files
Authorization: Bearer <token>

# Response
{
  "files": [
    {
      "filename": "2024-01-01T12-00-00-000Z-archive.zip",
      "size": 1048576,
      "sizeFormatted": "1.00 MB",
      "hash": "sha256-hash-here",
      "uploadTime": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Server Status
```bash
GET /status

# Response
{
  "status": "running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "authenticated": false
}
```

## 📁 Project Structure

```
recebe-file/
├── server.js              # Secure Express application with all security features
├── package.json           # Dependencies including security packages
├── public/
│   └── index.html         # Authenticated frontend with encryption indicators
├── uploads/               # Secure file storage directory
├── .port                  # Current server port (auto-generated)
├── .token                 # Current access token (auto-generated)
├── server.crt            # SSL certificate (auto-generated)
├── server.key            # SSL private key (auto-generated)
├── server.log            # Security audit log
├── CLAUDE.md             # Project instructions for Claude Code
├── .gitignore            # Git ignore rules
└── node_modules/          # Dependencies
```

## 🔧 Supported File Types

Only compressed/archive files are accepted:
- `.zip` - ZIP archives
- `.rar` - RAR archives  
- `.7z` - 7-Zip archives
- `.tar` - TAR archives
- `.gz` - Gzip compressed files
- `.bz2` - Bzip2 compressed files
- `.xz` - XZ compressed files

## 🛡️ Security Dependencies

### Core Security Packages
- **helmet** `^7.1.0` - Security headers middleware
- **express-rate-limit** `^7.1.5` - Rate limiting protection
- **express-session** `^1.17.3` - Secure session management
- **bcrypt** `^5.1.1` - Password hashing
- **winston** `^3.11.0` - Security audit logging
- **uuid** `^9.0.1` - Secure token generation

### Core Application
- **express** `^4.18.2` - Web framework
- **multer** `^1.4.5-lts.1` - File upload handling

## 🔍 Security Audit

### File Integrity
Every uploaded file includes:
- **SHA-256 hash** for integrity verification
- **Upload timestamp** for audit trails
- **Original filename** preservation
- **File size** validation

### Access Control
- **Token-based authentication** prevents unauthorized access
- **Session timeout** limits exposure window
- **Rate limiting** prevents abuse
- **IP-based tracking** for security monitoring

### Secure Logging
All security events are logged:
```bash
tail -f server.log | jq '.'
```

## 🚨 Security Best Practices

### Production Deployment
1. **Change default password**: Set `SERVER_PASSWORD` environment variable
2. **Use reverse proxy**: Deploy behind nginx/Apache with additional security
3. **Monitor logs**: Set up log monitoring and alerting
4. **Regular updates**: Keep dependencies updated for security patches
5. **Firewall rules**: Restrict access to necessary IPs only

### Operational Security
- **Rotate tokens**: Restart server periodically to generate new tokens
- **Monitor uploads**: Review `server.log` for suspicious activity
- **Backup strategy**: Implement secure backup for uploaded files
- **Virus scanning**: Consider integrating antivirus scanning for uploads

## 🔄 Development Workflow

### Development Commands
```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# View security logs
tail -f server.log

# Check current port
cat .port

# Check current token
cat .token
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/security-enhancement

# Commit changes
git add .
git commit -m "Add security features"

# Push and create PR
git push origin feature/security-enhancement
```

## 🐛 Troubleshooting

### SSL Certificate Issues
```bash
# Regenerate SSL certificates
rm server.crt server.key
npm start
```

### Port Conflicts
The server automatically finds available ports. If issues persist:
```bash
# Check what's using the port
netstat -tulpn | grep :PORT

# Set specific port
PORT=8443 npm start
```

### Authentication Issues
```bash
# Reset authentication
rm .token
npm start
```

## 📝 Changelog

### v1.1.0 - Security Enhancements
- ✅ Added token-based authentication
- ✅ Implemented HTTPS with auto-SSL generation
- ✅ Added comprehensive security headers
- ✅ Implemented rate limiting
- ✅ Added file integrity verification (SHA-256)
- ✅ Enhanced logging and audit trails
- ✅ Added random port selection
- ✅ Improved filename sanitization

### v1.0.0 - Initial Release
- ✅ Basic file upload functionality
- ✅ Compressed file type validation
- ✅ Frontend interface

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a security-focused feature branch
3. Implement with security best practices
4. Add comprehensive tests
5. Submit PR with security impact assessment

## 📞 Support

For security issues or vulnerabilities:
- **Security Contact**: Report privately to repository maintainers
- **General Issues**: Use GitHub issues for non-security bugs
- **Documentation**: Check CLAUDE.md for development guidance

---

**⚠️ Security Notice**: This application handles file uploads. Always deploy with proper security measures, monitoring, and regular security updates in production environments.