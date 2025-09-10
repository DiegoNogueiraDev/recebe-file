# Suggested Commands

## Development Commands
- `npm start` - Start the production server (node server.js)
- `npm run dev` - Start development server with auto-restart (nodemon)

## Server Management
- `node server.js` - Direct server startup
- `PORT=3000 npm start` - Start server on custom port (default: 35678)

## System Commands (Linux)
- `ls -la` - List files with details
- `cd <directory>` - Change directory
- `grep -r "pattern" .` - Search for text patterns recursively
- `find . -name "*.js"` - Find JavaScript files
- `cat <file>` - Display file contents
- `tail -f <logfile>` - Follow log files in real-time

## Git Commands
- `git status` - Check repository status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git log --oneline` - View commit history
- `git branch` - List branches
- `git checkout -b <branch-name>` - Create and switch to new branch

## File Management
- `mkdir <directory>` - Create directory
- `rm -rf <directory>` - Remove directory recursively
- `cp <source> <destination>` - Copy files
- `mv <source> <destination>` - Move/rename files

## Process Management
- `ps aux | grep node` - Find Node.js processes
- `kill <pid>` - Stop process by ID
- `pkill -f "server.js"` - Stop server process by name

## Network & Testing
- `curl -X POST -F "compressedFile=@test.zip" http://localhost:35678/upload` - Test file upload
- `curl http://localhost:35678/health` - Check server health
- `netstat -tulpn | grep 35678` - Check if port is in use

## File Upload Testing
- `curl -F "compressedFile=@example.zip" http://localhost:35678/upload` - Upload test file
- `ls -la uploads/` - Check uploaded files directory