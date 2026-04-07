const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const statusContainer = document.getElementById('status-container');
const statusMessage = document.getElementById('status-message');
const resultContainer = document.getElementById('result-container');
const downloadList = document.getElementById('download-list');
const resetBtn = document.getElementById('reset-btn');
const downloadAllBtn = document.getElementById('download-all-btn');

// jsPDF alias
const { jsPDF } = window.jspdf;

// Track generated files for ZIP
let generatedFiles = [];
// Track uploaded images for merging into a single PDF
let currentUploadedImages = [];

const mergePdfBtn = document.getElementById('merge-pdf-btn');

// Initialize Sortable logic
new Sortable(downloadList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    handle: '.drag-handle'
});

// Drag & Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

dropZone.addEventListener('drop', handleDrop, false);

// Click to browse
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

// Reset
resetBtn.addEventListener('click', resetUI);

// Download All
downloadAllBtn.addEventListener('click', async () => {
    if (generatedFiles.length === 0) return;
    
    // Change button state
    const originalText = downloadAllBtn.textContent;
    downloadAllBtn.textContent = '圧縮中...';
    downloadAllBtn.disabled = true;

    try {
        const zip = new JSZip();
        
        // DOMの順番を取得して並び替える
        const sortedIndices = Array.from(downloadList.children).map(li => parseInt(li.dataset.index, 10));
        
        if (sortedIndices.length === 0) {
            alert('ダウンロードするファイルがありません。');
            return;
        }
        
        sortedIndices.forEach(i => {
            const file = generatedFiles[i];
            if (file) {
                zip.file(file.filename, file.data, {
                    date: new Date(),
                    dosPermissions: 32, // Archive bit
                    unixPermissions: "0644"
                });
            }
        });

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            },
            platform: 'DOS'
        });
        
        // File System Access APIを使用すると、WindowsのMark of the Web（セキュリティブロック）を回避できる
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'converted_files.zip',
                    types: [{
                        description: 'ZIPファイル',
                        accept: { 'application/zip': ['.zip'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(zipBlob);
                await writable.close();
                return; // 保存成功
            } catch (err) {
                // ユーザーがキャンセルした場合はそのまま終了
                if (err.name === 'AbortError') return;
                console.warn('FilePickerでエラーが発生したため、通常のダウンロードにフォールバックします', err);
            }
        }

        // フォールバック（FileSaver.js）
        saveAs(zipBlob, 'converted_files.zip');
    } catch(err) {
        console.error('ZIP作成エラー:', err);
        alert('一括ダウンロードの処理中にエラーが発生しました。');
    } finally {
        downloadAllBtn.textContent = originalText;
        downloadAllBtn.disabled = false;
    }
});
// Merge into single PDF
mergePdfBtn.addEventListener('click', async () => {
    if (currentUploadedImages.length === 0) return;
    
    const originalText = mergePdfBtn.textContent;
    mergePdfBtn.textContent = '結合中...';
    mergePdfBtn.disabled = true;

    try {
        let doc;
        
        // DOMの順番を取得して並び替える
        const sortedIndices = Array.from(downloadList.children).map(li => parseInt(li.dataset.index, 10));

        if (sortedIndices.length === 0) {
            alert('結合するファイルがありません。');
            return;
        }

        for (let idx = 0; idx < sortedIndices.length; idx++) {
            const fileIndex = sortedIndices[idx];
            // PDF出力からJPEGを抽出した場合はcurrentUploadedImagesに無いのでスキップするか保護する
            // ここはJPEG->PDF変換時専用の配列を使う
            const file = currentUploadedImages[fileIndex];
            if (!file) continue;

            const imgData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imgData;
            });
            
            const orientation = img.width > img.height ? 'l' : 'p';
            
            if (!doc) {
                doc = new jsPDF({
                    orientation: orientation,
                    unit: 'px',
                    format: [img.width, img.height]
                });
            } else {
                doc.addPage([img.width, img.height], orientation);
            }
            
            doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
        }
        
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        
        if (window.showSaveFilePicker) {
            try {
                 const handle = await window.showSaveFilePicker({
                     suggestedName: 'merged_images.pdf',
                     types: [{
                         description: 'PDFファイル',
                         accept: { 'application/pdf': ['.pdf'] }
                     }]
                 });
                 const writable = await handle.createWritable();
                 await writable.write(pdfBlob);
                 await writable.close();
            } catch (err) {
                 if (err.name !== 'AbortError') {
                     saveAs(pdfBlob, 'merged_images.pdf');
                 }
            }
        } else {
             saveAs(pdfBlob, 'merged_images.pdf');
        }
    } catch(err) {
        console.error('PDF結合エラー:', err);
        alert('PDFの結合中にエラーが発生しました。');
    } finally {
        mergePdfBtn.textContent = originalText;
        mergePdfBtn.disabled = false;
    }
});
function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}

function resetUI() {
    dropZone.classList.remove('hidden');
    statusContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    downloadList.innerHTML = '';
    fileInput.value = '';
    generatedFiles = [];
    currentUploadedImages = [];
    downloadAllBtn.classList.add('hidden');
    mergePdfBtn.classList.add('hidden');
}

async function handleFiles(files) {
    if (files.length === 0) return;
    
    currentUploadedImages = [];
    dropZone.classList.add('hidden');
    statusContainer.classList.remove('hidden');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        statusMessage.textContent = `変換中... ${file.name} (${i+1}/${files.length})`;
        
        try {
            if (file.type === 'application/pdf') {
                await convertPdfToJpeg(file);
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
                // PNGも念のため受け入れてPDFにします
                await convertImageToPdf(file);
            } else {
                alert(`非対応のファイル形式です: ${file.name}`);
            }
        } catch (error) {
            console.error('変換エラー:', error);
            alert(`${file.name}の変換に失敗しました。\n詳細: ${error.message}`);
        }
    }
    
    if (generatedFiles.length > 1 || (files[0] && files[0].type === 'application/pdf' && generatedFiles.length > 0)) {
        // Show Download All button if there are multiple images generated (e.g. multi-page PDF or multiple files)
        downloadAllBtn.classList.remove('hidden');
    }
    
    if (currentUploadedImages.length > 1) {
        mergePdfBtn.classList.remove('hidden');
    }
    
    statusContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
}

async function convertPdfToJpeg(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    
    // 全ページをJPEG化
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        // 高画質のためにscaleを2に設定
        const viewport = page.getViewport({ scale: 2.0 }); 
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // ArrayBufferとして取得 (JSZipでの扱いをより確実にし、セキュリティ問題を回避)
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        const arrayBuffer = await blob.arrayBuffer();
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 画面上のリンク表示用
        
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        
        // 複数ページの場合はページ番号をつける
        const newFileName = pdf.numPages > 1 ? `${baseName}_page${pageNum}.jpg` : `${baseName}.jpg`;
        
        // 保存データとして配列に追加
        generatedFiles.push({
            filename: newFileName,
            data: arrayBuffer,
            isBase64: false
        });
        
        // JPEG出力用なのでサムネイルとして自分自身のdataUrlを使用
        addDownloadLink(dataUrl, newFileName, '🖼️', dataUrl);
    }
}

async function convertImageToPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                try {
                    // 追加：画像を記録 (画像のドラッグ＆ドロップ時に結合用配列に追加)
                    currentUploadedImages.push(file);

                    // 画像サイズに合わせてPDFページの向きを決定
                    const orientation = img.width > img.height ? 'l' : 'p';
                    const doc = new jsPDF({
                        orientation: orientation,
                        unit: 'px',
                        format: [img.width, img.height]
                    });
                    
                    doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
                    
                    const pdfArrayBuffer = doc.output('arraybuffer');
                    const pdfBlobForUrl = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
                    const url = URL.createObjectURL(pdfBlobForUrl);
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    const pdfFileName = `${baseName}.pdf`;
                    
                    // 保存データとして配列に追加
                    generatedFiles.push({
                        filename: pdfFileName,
                        data: pdfArrayBuffer,
                        isBase64: false
                    });
                    
                    // サムネイル用として元画像のe.target.resultを使う
                    addDownloadLink(url, pdfFileName, '📄', e.target.result);
                    resolve();
                } catch(err) {
                    reject(err);
                }
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function addDownloadLink(url, filename, icon, thumbnailData = null) {
    const li = document.createElement('li');
    // ドラッグ＆ドロップで順番を変えるためのインデックスを記録
    li.dataset.index = downloadList.children.length;
    li.style.cursor = 'grab'; // リスト自体もドラッグ可能であることを示す
    
    // ドラッグ用のハンドルアイコン
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '⋮⋮'; 
    handle.style.marginRight = '12px';
    handle.style.color = '#9ca3af';
    handle.style.fontSize = '1.2rem';
    handle.style.userSelect = 'none';
    
    // サムネイル表示を追加
    const iconOrThumb = document.createElement('div');
    iconOrThumb.style.marginRight = '12px';
    if (thumbnailData) {
        iconOrThumb.innerHTML = `<img src="${thumbnailData}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">`;
    } else {
        iconOrThumb.innerHTML = `<span>${icon}</span>`;
    }
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'file-info';
    infoDiv.style.flex = '1';
    infoDiv.innerHTML = `<span>${filename}</span>`;
    
    // 親となるラップ要素
    const leftContent = document.createElement('div');
    leftContent.style.display = 'flex';
    leftContent.style.alignItems = 'center';
    leftContent.style.flex = '1';
    leftContent.appendChild(handle);
    leftContent.appendChild(iconOrThumb);
    leftContent.appendChild(infoDiv);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.className = 'download-link';
    a.textContent = 'ダウンロード';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'このページを削除';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = '#ef4444';
    deleteBtn.style.fontSize = '1.2rem';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.padding = '4px 8px';
    deleteBtn.style.marginLeft = '4px';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.transition = 'background 0.2s';
    
    deleteBtn.onmouseover = () => deleteBtn.style.background = 'rgba(239, 68, 68, 0.1)';
    deleteBtn.onmouseout = () => deleteBtn.style.background = 'transparent';
    
    deleteBtn.onclick = () => {
        li.remove();
        // 全て削除された場合の表示更新
        if (downloadList.children.length === 0) {
            document.getElementById('download-all-btn').classList.add('hidden');
            document.getElementById('merge-pdf-btn').classList.add('hidden');
        }
    };

    const rightContent = document.createElement('div');
    rightContent.style.display = 'flex';
    rightContent.style.alignItems = 'center';
    
    rightContent.appendChild(a);
    rightContent.appendChild(deleteBtn);

    li.appendChild(leftContent);
    li.appendChild(rightContent);
    
    downloadList.appendChild(li);
}
