# Code Style and Conventions

## JavaScript Style
- **ES6+ Syntax**: Uses modern JavaScript with const/let, arrow functions where appropriate
- **Naming Convention**: camelCase for variables and functions (e.g., `uploadZone`, `fileInput`)
- **Constants**: SCREAMING_SNAKE_CASE for constants (e.g., `PORT`)
- **String Literals**: Template literals for dynamic strings, single quotes for static strings
- **Semicolons**: Consistent use of semicolons at line endings

## Node.js/Express Patterns
- **Middleware Pattern**: Uses Express middleware for error handling and file processing
- **Callback Pattern**: Traditional Node.js callback style (req, res, next)
- **Error Handling**: Structured error responses with JSON format
- **Logging**: Console logging for important events and errors

## File Structure Conventions
- **Server Logic**: All in `server.js` (single-file approach)
- **Static Assets**: Organized in `public/` directory
- **File Naming**: kebab-case for HTML/CSS files, camelCase for JavaScript
- **Directory Names**: lowercase with hyphens

## HTML/CSS Conventions
- **Language**: Portuguese (pt-BR) for user-facing content
- **CSS Classes**: kebab-case (e.g., `upload-zone`, `file-info`)
- **IDs**: camelCase (e.g., `uploadZone`, `fileInput`)
- **Semantic HTML**: Uses appropriate HTML5 semantic elements

## Security Practices
- **File Validation**: Both MIME type and extension checking
- **Filename Sanitization**: Removes special characters, adds timestamps
- **File Size Limits**: 100MB maximum file size
- **Path Security**: Uses `path.join()` for safe path construction
- **Error Messages**: Generic error messages to avoid information disclosure

## API Response Format
```javascript
{
    success: boolean,
    message: string,
    // Additional data fields as needed
    filename?: string,
    originalName?: string,
    size?: number
}
```

## No Current Linting/Formatting
- No ESLint, Prettier, or other code formatting tools configured
- Manual code style consistency
- No automated style enforcement