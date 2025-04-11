document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const fileInput = document.getElementById('uploadImage');
    const formatSelect = document.getElementById('formatSelect');
    const convertBtn = document.getElementById('convertBtn');
    const downloadLink = document.getElementById('downloadLink');
    const preview = document.getElementById('previewImage');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileStatus = document.querySelector('.file-status');
    const fileContainer = document.querySelector('.file-input-container');

    fileContainer.addEventListener('click', function(e) {
        if (e.target === fileContainer || e.target.classList.contains('upload-content') || 
            e.target.classList.contains('upload-icon') || e.target.classList.contains('drop-text')) {
            fileInput.click();
        }
    });

    // Mostrar nombre del archivo seleccionado
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length) {
            fileStatus.textContent = this.files[0].name;
            loadImage(this.files[0]);
        } else {
            fileStatus.textContent = 'Sin archivos seleccionados';
        }
    });

    // Cargar y previsualizar imagen
    function loadImage(file) {
        if (!file.type.match('image.*')) {
            alert('Por favor, selecciona un archivo de imagen válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Drag and Drop
    fileContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#4cc9f0';
        this.style.backgroundColor = '#333';
    });

    fileContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#4361ee';
        this.style.backgroundColor = '';
    });

    fileContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#4361ee';
        this.style.backgroundColor = '';
        
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            fileStatus.textContent = e.dataTransfer.files[0].name;
            loadImage(e.dataTransfer.files[0]);
        }
    });

    // Conversión de imagen
    convertBtn.addEventListener('click', function() {
        if (!fileInput.files || !fileInput.files.length) {
            alert('Por favor, selecciona una imagen.');
            return;
        }
        
        // Estado de carga
        convertBtn.disabled = true;
        convertBtn.classList.add('loading');
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        const file = fileInput.files[0];
        const format = formatSelect.value;
        
        setTimeout(function() {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const img = new Image();
                
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    let mimeType = 'image/png';
                    if (format === 'jpeg') mimeType = 'image/jpeg';
                    else if (format === 'webp') mimeType = 'image/webp';
                    else if (format === 'bmp') mimeType = 'image/bmp';
                    else if (format === 'tiff') mimeType = 'image/tiff';
                    else if (format === 'gif') mimeType = 'image/gif';
                    
                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        
                        downloadLink.href = url;
                        downloadLink.download = 'imagen_convertida.' + format;
                        downloadLink.classList.remove('hidden');
                        downloadLink.innerHTML = `<i class="fas fa-download"></i> Descargar (${format.toUpperCase()})`;
                        
                        // Restaurar botón
                        convertBtn.disabled = false;
                        convertBtn.classList.remove('loading');
                        convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convertir';
                        
                        // Limpiar memoria
                        downloadLink.addEventListener('click', function() {
                            setTimeout(function() {
                                URL.revokeObjectURL(url);
                            }, 100);
                        });
                    }, mimeType);
                };
                
                img.onerror = function() {
                    alert('Error al cargar la imagen');
                    convertBtn.disabled = false;
                    convertBtn.classList.remove('loading');
                    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convertir';
                };
                
                img.src = event.target.result;
            };
            
            reader.onerror = function() {
                alert('Error al leer el archivo');
                convertBtn.disabled = false;
                convertBtn.classList.remove('loading');
                convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convertir';
            };
            
            reader.readAsDataURL(file);
        }, 500);
    });
});