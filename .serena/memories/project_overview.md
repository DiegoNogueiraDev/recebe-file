# Project Overview: File Upload Server

## Purpose
This is a **Node.js Express server** for uploading and storing compressed files. It provides a secure web interface for uploading compressed file formats (.zip, .7z, .rar, .tar, .gz, .tar.gz) with a maximum size limit of 100MB.

## Key Features
- Secure file upload with MIME type and extension validation
- Support for multiple compressed file formats
- File size limit of 100MB
- Unique filename generation with timestamps
- Portuguese (pt-BR) web interface with drag-and-drop functionality
- Upload progress tracking
- File upload history
- Health check endpoint

## Tech Stack
- **Backend**: Node.js with Express.js framework
- **File Upload**: Multer middleware for handling multipart/form-data
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Language**: Server-side JavaScript (Node.js)
- **UI Language**: Portuguese (pt-BR)

## Project Structure
```
recebe-file/
├── server.js           # Main server file with Express app and Multer configuration
├── package.json        # Project dependencies and scripts
├── package-lock.json   # Exact dependency versions
├── .gitignore         # Git ignore patterns
├── public/            # Static web assets
│   ├── index.html     # Upload interface (Portuguese)
│   ├── script.js      # Client-side JavaScript
│   └── style.css      # Styling
└── uploads/           # Directory for uploaded files (created automatically)
```

## Current State
- Functional file upload server with security validations
- Web interface with modern UI/UX
- Portuguese localization
- Basic error handling and logging
- No tests or linting configuration currently present