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

// Max file size: 3GB
const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024;

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

    // Size validation (3GB)
    if (file.size > MAX_FILE_SIZE) {
        showMessage('Arquivo muito grande. Tamanho máximo: 3GB', 'error');
        return;
    }

    // File is valid
    selectedFile = file;
    displayFileInfo(file);
    showUploadButton();
    showMessage('Arquivo selecionado. Pronto para upload!', 'success');
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

    // Set timeout (30 minutes for large files)
    xhr.timeout = 30 * 60 * 1000;

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