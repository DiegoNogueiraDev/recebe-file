# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **secure** Node.js file upload server specifically designed for compressed/archive files with enterprise-grade security features. The application consists of:
- **Backend**: Express.js server with comprehensive security middleware (`server.js`)
- **Frontend**: Authenticated single-page HTML application with encrypted transfers (`public/index.html`)
- **Storage**: Local filesystem storage with file integrity verification in `uploads/` directory

## Development Commands

```bash
# Install dependencies (includes security packages)
npm install

# Start development server with auto-reload
npm run dev

# Start production server (auto-generates SSL certificates)
npm start
```

## Security Features

### Random Port Selection
- Server automatically selects a random port between 20000-65535 on each startup
- Port availability checking ensures no conflicts
- Port information saved to `.port` file

### HTTPS & SSL
- Automatic self-signed SSL certificate generation (requires OpenSSL)
- HTTPS by default for encrypted transfers
- Falls back to HTTP if SSL generation fails

### Authentication & Authorization
- Token-based authentication system
- Password-protected access (default: 'securepass123')
- Session management with secure cookies
- Rate limiting: 10 uploads per 15 minutes per IP

### File Security
- SHA-256 hash generation for file integrity verification
- Filename sanitization to prevent path traversal attacks
- File type validation for compressed formats only
- Comprehensive logging with Winston

### Environment Variables
- `PORT`: Override random port selection
- `SERVER_PASSWORD`: Set custom authentication password

## Architecture Details

### File Upload Flow
1. User authentication required before any operations
2. Rate limiting applied per IP address
3. Files validated for compressed extensions: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2`, `.xz`
4. Maximum file size: 100MB
5. Files renamed with ISO timestamp prefix + sanitized name
6. SHA-256 hash generated for integrity verification
7. Secure logging of all operations

### API Endpoints
- `POST /auth` - Authentication endpoint (requires password)
- `POST /upload` - Protected file upload with token authentication
- `GET /files` - Protected file listing with hash verification
- `GET /status` - Server status and authentication check
- `GET /` - Serve the main HTML interface

### Security Headers & Middleware
- **Helmet.js**: Comprehensive security headers (CSP, HSTS, etc.)
- **Rate Limiting**: IP-based upload restrictions
- **Session Security**: HttpOnly, secure cookies
- **CORS Protection**: Controlled access policies

### File Structure
```
recebe-file/
├── server.js              # Secure Express application
├── package.json           # Dependencies (includes security packages)
├── public/
│   └── index.html         # Authenticated frontend with security features
├── uploads/               # Encrypted file storage directory
├── .port                  # Current server port (auto-generated)
├── .token                 # Current access token (auto-generated)
├── server.crt            # SSL certificate (auto-generated)
├── server.key            # SSL private key (auto-generated)
├── server.log            # Security audit log
└── node_modules/          # Dependencies
```

## Security Dependencies
- **helmet**: Security headers middleware
- **express-rate-limit**: Rate limiting protection
- **uuid**: Secure token generation
- **bcrypt**: Password hashing
- **express-session**: Secure session management
- **winston**: Security audit logging

## Access Information
After starting the server, check console output or these files:
- **Port**: Saved in `.port` file
- **Access Token**: Saved in `.token` file  
- **Default Password**: 'securepass123' (change via SERVER_PASSWORD env var)

## Key Configuration Points
- File size limit: `server.js:155` (100MB)
- Allowed extensions: `server.js:159`
- Upload directory: `server.js:41`
- Rate limit window: `server.js:89` (15 minutes, 10 uploads)
- Session expiry: `server.js:109` (24 hours)

## Security Best Practices
- Always use HTTPS in production
- Change default password via environment variable
- Monitor `server.log` for security events
- Regularly rotate access tokens
- Consider implementing virus scanning for uploaded files