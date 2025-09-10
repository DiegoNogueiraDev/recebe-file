# Task Completion Checklist

## Before Considering Task Complete

### Code Quality Checks
- **Manual Code Review**: Review changes for adherence to existing patterns
- **Function Testing**: Test functionality manually (no automated tests currently)
- **Error Handling**: Ensure proper error responses and logging
- **Security Validation**: Verify file upload security measures remain intact

### Server Testing
- **Start Server**: `npm start` or `npm run dev` should work without errors
- **Health Check**: `curl http://localhost:35678/health` should return status OK
- **Upload Test**: Test file upload functionality through web interface
- **File Validation**: Test with both valid and invalid file types
- **Size Limits**: Test with files approaching 100MB limit

### File System Checks
- **Uploads Directory**: Ensure `/uploads` directory exists and is writable
- **File Permissions**: Check that uploaded files have correct permissions
- **Cleanup**: Remove any test files from uploads directory if needed

### Git Workflow
- **Status Check**: `git status` to review changes
- **Staging**: `git add .` to stage relevant changes
- **Commit**: `git commit -m "descriptive message"` with clear commit message
- **Branch Check**: Ensure working on appropriate feature branch

### Documentation Updates
- **Code Comments**: Add comments for complex logic if needed
- **README Updates**: Update project documentation if functionality changed
- **Memory Updates**: Update Serena memories if project structure changed

## No Automated Tools Available
- **No Linting**: No ESLint configuration to run
- **No Testing**: No automated test suite to execute  
- **No Formatting**: No Prettier or automated formatting
- **No Build Process**: Direct Node.js execution, no build step required

## Final Verification
- **Server Restart**: Stop and restart server to ensure clean startup
- **Browser Test**: Test web interface functionality in browser
- **Log Review**: Check server logs for any errors or warnings
- **Upload Flow**: Complete end-to-end file upload test