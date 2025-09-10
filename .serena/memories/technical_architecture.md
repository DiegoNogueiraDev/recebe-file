# Technical Architecture

## Server Architecture
- **Framework**: Express.js web server
- **Port**: 35678 (configurable via PORT environment variable)
- **Static Serving**: Express static middleware serves `/public` directory
- **File Upload**: Multer middleware with disk storage configuration

## File Upload Pipeline
1. **Client Upload** → Web form with drag-and-drop interface
2. **Multer Processing** → File validation and disk storage
3. **Security Checks** → MIME type and extension validation  
4. **Filename Generation** → Sanitization + timestamp uniqueness
5. **Storage** → Files saved to `/uploads` directory
6. **Response** → JSON success/error response

## Security Measures
- **File Type Whitelist**: Only compressed formats allowed
- **Extension Validation**: `.zip, .7z, .rar, .tar, .gz, .tar.gz`
- **MIME Type Validation**: Validates actual file headers
- **Size Limits**: 100MB maximum per file
- **Filename Sanitization**: Special characters replaced with underscores
- **Single File**: Only one file per upload request

## Error Handling
- **Multer Errors**: File size, unexpected fields, validation failures
- **Custom Validation**: File type rejection with clear messages  
- **Server Errors**: Generic internal server error responses
- **Client Feedback**: Structured JSON error responses

## Dependencies
- **express**: ^4.18.2 - Web server framework
- **multer**: ^2.0.0 - File upload middleware  
- **nodemon**: ^3.0.1 - Development auto-restart (dev dependency)

## File Organization
- **Separation**: Static assets in `/public`, server logic in `server.js`
- **Upload Storage**: Dynamic `/uploads` directory creation
- **Single Responsibility**: Each file has clear purpose

## No Database
- **File Metadata**: Not persisted beyond server response
- **Upload History**: Client-side only (localStorage)
- **User Management**: No authentication/authorization system