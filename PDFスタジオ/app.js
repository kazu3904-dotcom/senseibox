// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// State
let pages = []; // { id, blob, originalIndex, rotation, thumbnail, docId }
let originalDocs = {}; // docId -> Uint8Array bytes

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const workspaceArea = document.getElementById('workspace-area');
const pagesGrid = document.getElementById('pages-grid');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const exportBtn = document.getElementById('export-btn');
const resetBtn = document.getElementById('reset-btn');
const addPdfBtn = document.getElementById('add-pdf-btn');
const globalDropOverlay = document.getElementById('global-drop-overlay');

// Initialize Sortable
let sortable;

// Generate UUID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
addPdfBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
resetBtn.addEventListener('click', resetWorkspace);
exportBtn.addEventListener('click', exportPDF);

// Drag and drop for upload area
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

let dragCounter = 0;

// Global drag and drop for appending files
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
});

document.body.addEventListener('dragenter', (e) => {
    if (!workspaceArea.classList.contains('hidden')) {
        dragCounter++;
        globalDropOverlay.classList.remove('hidden');
    }
});

document.body.addEventListener('dragleave', (e) => {
    if (!workspaceArea.classList.contains('hidden')) {
        dragCounter--;
        if (dragCounter === 0) {
            globalDropOverlay.classList.add('hidden');
        }
    }
});

document.body.addEventListener('drop', (e) => {
    dragCounter = 0;
    globalDropOverlay.classList.add('hidden');
    
    // Process file if in workspace mode
    if (!workspaceArea.classList.contains('hidden')) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('drag-over');
    }, false);
});

uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
});

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
        // Reset input to allow selecting the same file again if needed
        e.target.value = '';
    }
}

async function processFile(file) {
    if (file.type !== 'application/pdf') {
        alert('PDFファイルを選択してください。');
        return;
    }

    showLoading('PDFを読み込み中...');

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // PDF.jsのWebWorkerがArrayBufferを所有（Detach）してしまうため、
        // pdf-lib保存用にメモリ領域をコピーしてから保管します。
        const bufferCopy = arrayBuffer.slice(0);
        const pdfLibBytes = new Uint8Array(bufferCopy);
        const pdfJsBytes = new Uint8Array(arrayBuffer);
        
        const docId = generateId();
        originalDocs[docId] = pdfLibBytes;

        // Load with PDF.js for rendering
        const pdf = await pdfjsLib.getDocument({ data: pdfJsBytes }).promise;
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
            showLoading(`ページ ${i} / ${numPages} をレンダリング中...`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 }); // Use scale 1.0 for processing, display handles size
            
            // Limit render resolution to keep performance high
            const scale = Math.min(2.0, 800 / viewport.width);
            const renderViewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = renderViewport.width;
            canvas.height = renderViewport.height;

            await page.render({
                canvasContext: context,
                viewport: renderViewport
            }).promise;

            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

            pages.push({
                id: generateId(),
                docId: docId,
                originalIndex: i - 1, // 0-based for pdf-lib
                rotation: 0,
                thumbnail: thumbnail
            });
        }

        renderPagesGrid();
        
        uploadArea.classList.add('hidden');
        workspaceArea.classList.remove('hidden');
    } catch (error) {
        console.error('Error processing PDF:', error);
        alert('PDFの読み込みに失敗しました。');
    } finally {
        hideLoading();
    }
}

function renderPagesGrid() {
    pagesGrid.innerHTML = '';
    
    pages.forEach((pageObj, index) => {
        const card = document.createElement('div');
        card.className = 'page-card';
        card.dataset.id = pageObj.id;

        card.innerHTML = `
            <div class="page-number">${index + 1}</div>
            <div class="page-preview">
                <canvas id="canvas-${pageObj.id}"></canvas>
            </div>
            <div class="page-controls">
                <button class="control-btn btn-rotate" onclick="rotatePage('${pageObj.id}')" title="回転">
                    <i class="ph-bold ph-arrow-clockwise"></i>
                </button>
                <button class="control-btn btn-delete" onclick="deletePage('${pageObj.id}')" title="削除">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </div>
        `;
        
        pagesGrid.appendChild(card);
        
        // Draw image onto canvas to support rotation smoothly
        const canvas = document.getElementById(`canvas-${pageObj.id}`);
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            drawRotated(canvas, ctx, img, pageObj.rotation);
        };
        img.src = pageObj.thumbnail;
    });

    // Initialize or refresh Sortable
    if (sortable) {
        sortable.destroy();
    }
    
    sortable = new Sortable(pagesGrid, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        forceFallback: true, // Forces custom drag UI to apply rotation and big shadow in all browsers
        fallbackClass: 'sortable-drag',
        fallbackOnBody: true,
        onEnd: function () {
            // Reorder the pages array based on DOM order
            const itemElements = Array.from(pagesGrid.children);
            const newPages = [];
            itemElements.forEach(el => {
                const id = el.dataset.id;
                const page = pages.find(p => p.id === id);
                if (page) newPages.push(page);
            });
            pages = newPages;
            
            // Update page numbers visually
            document.querySelectorAll('.page-card').forEach((card, idx) => {
                card.querySelector('.page-number').innerText = idx + 1;
            });
        }
    });
}

function drawRotated(canvas, ctx, img, rotation) {
    if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
    } else {
        canvas.width = img.width;
        canvas.height = img.height;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
}

window.rotatePage = (id) => {
    const pageIndex = pages.findIndex(p => p.id === id);
    if (pageIndex > -1) {
        pages[pageIndex].rotation = (pages[pageIndex].rotation + 90) % 360;
        
        // Redraw canvas with new rotation
        const canvas = document.getElementById(`canvas-${id}`);
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            drawRotated(canvas, ctx, img, pages[pageIndex].rotation);
        };
        img.src = pages[pageIndex].thumbnail;
    }
};

window.deletePage = (id) => {
    pages = pages.filter(p => p.id !== id);
    if (pages.length === 0) {
        resetWorkspace();
    } else {
        renderPagesGrid();
    }
};

function resetWorkspace() {
    pages = [];
    originalDocs = {};
    uploadArea.classList.remove('hidden');
    workspaceArea.classList.add('hidden');
    fileInput.value = '';
}

function showLoading(text) {
    loadingText.innerText = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

async function exportPDF() {
    if (pages.length === 0) return;
    
    showLoading('PDFを保存しています...');
    
    try {
        const { PDFDocument, degrees } = PDFLib;
        const newPdfDoc = await PDFDocument.create();
        
        // Cache loaded pdf-lib docs
        const loadedDocs = {};
        
        for (const pageObj of pages) {
            const { docId, originalIndex, rotation } = pageObj;
            
            if (!loadedDocs[docId]) {
                loadedDocs[docId] = await PDFDocument.load(originalDocs[docId]);
            }
            
            const sourceDoc = loadedDocs[docId];
            const [copiedPage] = await newPdfDoc.copyPages(sourceDoc, [originalIndex]);
            
            if (rotation !== 0) {
                const currentRotationObj = copiedPage.getRotation();
                const currentRotation = currentRotationObj ? currentRotationObj.angle : 0;
                copiedPage.setRotation(degrees(currentRotation + rotation));
            }
            
            newPdfDoc.addPage(copiedPage);
        }
        
        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited_pdf_${new Date().getTime()}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`PDFの保存中にエラーが発生しました。\n\n詳細エラー:\n${error.message}\n\n※このメッセージをそのままアシスタントにお伝えください。`);
    } finally {
        hideLoading();
    }
}
