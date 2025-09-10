// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const uploadBtn = document.getElementById('uploadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const messageContainer = document.getElementById('messageContainer');
const uploadHistory = document.getElementById('uploadHistory');
const historyList = document.getElementById('historyList');

// State
let selectedFile = null;
let isUploading = false;

// Allowed file types
const allowedTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-gzip'
];

const allowedExtensions = ['.zip', '.7z', '.rar', '.tar', '.gz', '.tar.gz'];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadUploadHistory();
});

function setupEventListeners() {
    // Upload zone click
    uploadZone.addEventListener('click', () => {
        if (!isUploading) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);

    // Remove file
    removeFile.addEventListener('click', clearSelectedFile);

    // Upload button
    uploadBtn.addEventListener('click', uploadFile);

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    e.preventDefault();
    if (!isUploading) {
        uploadZone.classList.add('dragover');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileValidation(files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        handleFileValidation(e.target.files[0]);
    }
}

function handleFileValidation(file) {
    // Clear previous messages
    clearMessages();

    // Size validation (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('Arquivo muito grande. Tamanho máximo: 100MB', 'error');
        return;
    }

    // Extension validation
    const fileExtension = getFileExtension(file.name);
    if (!allowedExtensions.includes(fileExtension)) {
        showMessage(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedExtensions.join(', ')}`, 'error');
        return;
    }

    // MIME type validation
    if (!allowedTypes.includes(file.type)) {
        // Some browsers might not detect MIME correctly for some formats
        // So we'll be more lenient with MIME type checking
        console.warn('MIME type not in whitelist, but proceeding based on extension:', file.type);
    }

    // File is valid
    selectedFile = file;
    displayFileInfo(file);
    showUploadButton();
    showMessage('Arquivo válido selecionado. Pronto para upload!', 'success');
}

function getFileExtension(filename) {
    const ext = filename.toLowerCase();
    if (ext.endsWith('.tar.gz')) {
        return '.tar.gz';
    }
    return ext.substring(ext.lastIndexOf('.'));
}

function displayFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.remove('hidden');
}

function showUploadButton() {
    uploadBtn.classList.remove('hidden');
    uploadBtn.disabled = false;
}

function clearSelectedFile() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    uploadBtn.classList.add('hidden');
    progressContainer.classList.add('hidden');
    clearMessages();
    resetProgress();
}

function uploadFile() {
    if (!selectedFile || isUploading) return;

    isUploading = true;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Enviando...';
    progressContainer.classList.remove('hidden');

    const formData = new FormData();
    formData.append('compressedFile', selectedFile);

    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateProgress(percentComplete);
        }
    });

    // Load handler
    xhr.addEventListener('load', function() {
        try {
            const response = JSON.parse(xhr.responseText);
            
            if (xhr.status === 200 && response.success) {
                showMessage(
                    `✅ Upload realizado com sucesso!<br>
                    <strong>Arquivo:</strong> ${response.originalName}<br>
                    <strong>Tamanho:</strong> ${formatFileSize(response.size)}<br>
                    <strong>Salvo como:</strong> ${response.filename}`,
                    'success'
                );
                addToUploadHistory(response);
                resetForm();
            } else {
                throw new Error(response.message || 'Erro desconhecido');
            }
        } catch (error) {
            showMessage(`❌ Erro no upload: ${error.message}`, 'error');
        }
        
        finishUpload();
    });

    // Error handler
    xhr.addEventListener('error', function() {
        showMessage('❌ Erro de conexão durante o upload', 'error');
        finishUpload();
    });

    // Timeout handler
    xhr.addEventListener('timeout', function() {
        showMessage('❌ Timeout: Upload demorou muito para completar', 'error');
        finishUpload();
    });

    // Set timeout (5 minutes)
    xhr.timeout = 5 * 60 * 1000;

    // Send request
    xhr.open('POST', '/upload', true);
    xhr.send(formData);
}

function finishUpload() {
    isUploading = false;
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Fazer Upload';
}

function resetForm() {
    setTimeout(() => {
        clearSelectedFile();
        updateProgress(0);
    }, 2000);
}

function updateProgress(percent) {
    const roundedPercent = Math.round(percent);
    progressFill.style.width = percent + '%';
    progressText.textContent = roundedPercent + '%';
}

function resetProgress() {
    updateProgress(0);
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

function clearMessages() {
    messageContainer.innerHTML = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function addToUploadHistory(uploadData) {
    // Get existing history from localStorage
    let history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    
    // Add new upload to history
    history.unshift({
        originalName: uploadData.originalName,
        filename: uploadData.filename,
        size: uploadData.size,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 uploads
    history = history.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('uploadHistory', JSON.stringify(history));
    
    // Update display
    loadUploadHistory();
}

function loadUploadHistory() {
    const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    
    if (history.length === 0) {
        uploadHistory.classList.add('hidden');
        return;
    }
    
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div>
                <div class="history-filename">${item.originalName}</div>
                <div style="font-size: 0.8rem; color: #718096;">
                    ${formatFileSize(item.size)} • Salvo como: ${item.filename}
                </div>
            </div>
            <div class="history-time">${formatDateTime(item.timestamp)}</div>
        `;
        
        historyList.appendChild(historyItem);
    });
    
    uploadHistory.classList.remove('hidden');
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Health check on load
fetch('/health')
    .then(response => response.json())
    .then(data => {
        console.log('Server status:', data.status);
    })
    .catch(error => {
        console.warn('Server health check failed:', error);
        showMessage('⚠️ Aviso: Não foi possível conectar com o servidor', 'error');
    });