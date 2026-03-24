// Elementos DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const fileSelected = document.getElementById('fileSelected');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const resetFileBtn = document.getElementById('resetFileBtn');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newBtn = document.getElementById('newBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusMessage = document.getElementById('statusMessage');

let selectedFile = null;
let downloadUrl = null;

// ========== EVENT LISTENERS ==========

// Clique na área de upload
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Clique no botão "clique para selecionar"
selectBtn.addEventListener('click', (e) => {
  e.preventDefault();
  fileInput.click();
});

// Mudança no input file
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadArea.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect(files[0]);
  }
});

// Converter arquivo
convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  // Desabilitar botões
  convertBtn.disabled = true;
  convertBtn.textContent = '⏳ Convertendo...';
  
  // Mostrar progresso
  progressSection.style.display = 'block';
  progressFill.style.width = '0%';
  
  let simulatedProgress = 0;
  const progressInterval = setInterval(() => {
    simulatedProgress += Math.random() * 25;
    if (simulatedProgress > 90) simulatedProgress = 90;
    progressFill.style.width = simulatedProgress + '%';
  }, 200);
  
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    
    clearInterval(progressInterval);
    
    if (response.ok) {
      const blob = await response.blob();
      downloadUrl = window.URL.createObjectURL(blob);
      
      // 100% de progresso
      progressFill.style.width = '100%';
      progressText.textContent = 'Conversão concluída! 🎉';
      
      // Mostrar mensagem de sucesso
      showStatus('✅ Arquivo convertido com sucesso!', 'success');
      
      // Mostrar botões de ação
      setTimeout(() => {
        uploadArea.style.display = 'none';
        fileSelected.style.display = 'none';
        progressSection.style.display = 'none';
        
        convertBtn.style.display = 'none';
        downloadBtn.style.display = 'inline-flex';
        newBtn.style.display = 'inline-flex';
      }, 1500);
    } else {
      const errorData = await response.json();
      progressFill.style.width = '0%';
      progressSection.style.display = 'none';
      showStatus('❌ ' + (errorData.error || 'Erro ao converter'), 'error');
      convertBtn.disabled = false;
      convertBtn.textContent = '⚡ Converter agora';
    }
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Erro:', error);
    progressFill.style.width = '0%';
    progressSection.style.display = 'none';
    showStatus('❌ Erro ao conectar com servidor', 'error');
    convertBtn.disabled = false;
    convertBtn.textContent = '⚡ Converter agora';
  }
});

// Baixar PDF
downloadBtn.addEventListener('click', () => {
  if (downloadUrl) {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = selectedFile.name.replace('.pptx', '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showStatus('✅ Download iniciado!', 'success');
  }
});

// Novo arquivo
newBtn.addEventListener('click', () => {
  resetForm();
});

// Reset arquivo selecionado
resetFileBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  
  uploadArea.style.display = 'block';
  fileSelected.style.display = 'none';
  convertBtn.style.display = 'block';
  downloadBtn.style.display = 'none';
  newBtn.style.display = 'none';
  convertBtn.disabled = false;
  convertBtn.textContent = '⚡ Converter agora';
  
  clearStatus();
});

// ========== FUNÇÕES ==========

function handleFileSelect(file) {
  // Validar extensão
  if (!file.name.toLowerCase().endsWith('.pptx')) {
    showStatus('❌ Por favor, selecione um arquivo .pptx', 'error');
    return;
  }
  
  // Validar tamanho (100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    showStatus('❌ Arquivo muito grande. Máximo 100MB', 'error');
    return;
  }
  
  selectedFile = file;
  
  // Atualizar UI
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  uploadArea.style.display = 'none';
  fileSelected.style.display = 'block';
  convertBtn.style.display = 'inline-flex';
  convertBtn.disabled = false;
  convertBtn.textContent = '⚡ Converter agora';
  downloadBtn.style.display = 'none';
  newBtn.style.display = 'none';
  progressSection.style.display = 'none';
  
  clearStatus();
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message ' + type;
  statusMessage.style.display = 'block';
}

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
  statusMessage.style.display = 'none';
}

function resetForm() {
  selectedFile = null;
  downloadUrl = null;
  fileInput.value = '';
  progressFill.style.width = '0%';
  progressText.textContent = 'Preparando arquivo...';
  
  uploadArea.style.display = 'block';
  fileSelected.style.display = 'none';
  progressSection.style.display = 'none';
  convertBtn.style.display = 'block';
  downloadBtn.style.display = 'none';
  newBtn.style.display = 'none';
  
  convertBtn.disabled = false;
  convertBtn.textContent = '⚡ Converter agora';
  
  clearStatus();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// ========== INICIALIZAÇÃO ==========
console.log('✅ Script carregado com sucesso!');
