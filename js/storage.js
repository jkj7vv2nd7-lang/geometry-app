// ===== 保存・共有機能 =====

class StorageManager {
    constructor() {
        this.storageKey = 'geometry_app_data';
    }

    init() {
        // 保存オプションのイベントリスナー
        document.getElementById('saveImageOption').addEventListener('click', () => this.saveAsImage());
        document.getElementById('saveJSONOption').addEventListener('click', () => this.saveAsJSON());
        document.getElementById('saveSVGOption').addEventListener('click', () => this.saveAsSVG());
        document.getElementById('shareURLOption').addEventListener('click', () => this.generateShareURL());
        document.getElementById('loadJSONOption').addEventListener('click', () => this.loadFromJSON());
        document.getElementById('exportPDFOption').addEventListener('click', () => this.exportAsPDF());

        // コピーボタン
        document.getElementById('copyDataBtn')?.addEventListener('click', () => this.copyToClipboard('jsonDataArea'));
        document.getElementById('copyURLBtn')?.addEventListener('click', () => this.copyToClipboard('shareURLInput'));

        // ファイル入力
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));

        // ページ読み込み時にURLパラメータをチェック
        this.loadFromURL();
    }

    saveAsImage() {
        const canvas = document.getElementById('mainCanvas');
        
        try {
            // Canvas を画像として保存
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `geometry_${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
                
                this.showNotification('画像を保存しました！', 'success');
            });
        } catch (error) {
            console.error('画像保存エラー:', error);
            this.showNotification('画像の保存に失敗しました', 'error');
        }
    }

    saveAsJSON() {
        const data = this.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        
        // テキストエリアに表示
        const textarea = document.getElementById('jsonDataArea');
        textarea.value = jsonString;
        
        document.getElementById('dataDisplay').style.display = 'block';
        document.getElementById('urlDisplay').style.display = 'none';
        
        // ダウンロードリンクを作成
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `geometry_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('JSONデータを保存しました！', 'success');
    }

    saveAsSVG() {
        try {
            const svg = this.generateSVG();
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `geometry_${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('SVGファイルを保存しました！', 'success');
        } catch (error) {
            console.error('SVG保存エラー:', error);
            this.showNotification('SVGの保存に失敗しました', 'error');
        }
    }

    generateSVG() {
        const canvas = document.getElementById('mainCanvas');
        const width = canvas.width;
        const height = canvas.height;
        
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
`;

        // グリッドを追加
        svg += this.generateGridSVG(width, height);

        // 図形を追加
        window.shapes.forEach(shape => {
            svg += this.shapeToSVG(shape);
        });

        // 点を追加
        window.points.forEach(point => {
            svg += `    <circle cx="${point.x}" cy="${point.y}" r="${point.size}" fill="${point.color}"/>
`;
            if (point.label) {
                svg += `    <text x="${point.x + 10}" y="${point.y - 10}" font-size="12" font-weight="bold" fill="${point.color}">${point.label}</text>
`;
            }
        });

        svg += '</svg>';
        return svg;
    }

    generateGridSVG(width, height) {
        let svg = '    <g id="grid" stroke="#e0e0e0" stroke-width="1">\n';
        const gridSize = 20;
        
        // 縦線
        for (let x = 0; x < width; x += gridSize) {
            svg += `        <line x1="${x}" y1="0" x2="${x}" y2="${height}"/>\n`;
        }
        
        // 横線
        for (let y = 0; y < height; y += gridSize) {
            svg += `        <line x1="0" y1="${y}" x2="${width}" y2="${y}"/>\n`;
        }
        
        svg += '    </g>\n';
        return svg;
    }

    shapeToSVG(shape) {
        let svg = '';
        const stroke = shape.color;
        const strokeWidth = shape.lineWidth;
        const fill = shape.fillColor;
        const dashArray = shape.dashPattern.length > 0 ? shape.dashPattern.join(',') : 'none';
        
        switch (shape.type) {
            case 'segment':
                if (shape.points.length >= 2) {
                    svg += `    <line x1="${shape.points[0].x}" y1="${shape.points[0].y}" x2="${shape.points[1].x}" y2="${shape.points[1].y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
                
            case 'line':
                if (shape.points.length >= 2) {
                    const p1 = shape.points[0];
                    const p2 = shape.points[1];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const length = 3000;
                    const angle = Math.atan2(dy, dx);
                    const x1 = p1.x - length * Math.cos(angle);
                    const y1 = p1.y - length * Math.sin(angle);
                    const x2 = p1.x + length * Math.cos(angle);
                    const y2 = p1.y + length * Math.sin(angle);
                    svg += `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
                
            case 'circle':
                if (shape.points.length >= 2) {
                    const center = shape.points[0];
                    const radius = Math.sqrt((shape.points[1].x - center.x)**2 + (shape.points[1].y - center.y)**2);
                    svg += `    <circle cx="${center.x}" cy="${center.y}" r="${radius}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
                
            case 'triangle':
                if (shape.points.length >= 3) {
                    const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
                    svg += `    <polygon points="${points}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
                
            case 'rectangle':
                if (shape.points.length >= 2) {
                    const x = Math.min(shape.points[0].x, shape.points[1].x);
                    const y = Math.min(shape.points[0].y, shape.points[1].y);
                    const width = Math.abs(shape.points[1].x - shape.points[0].x);
                    const height = Math.abs(shape.points[1].y - shape.points[0].y);
                    svg += `    <rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
                
            case 'polygon':
                if (shape.points.length >= 3) {
                    const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
                    svg += `    <polygon points="${points}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-dasharray="${dashArray}"/>\n`;
                }
                break;
        }
        
        return svg;
    }

    generateShareURL() {
        const data = this.exportData();
        const compressed = this.compressData(data);
        
        // URLパラメータとして追加
        const url = new URL(window.location.href);
        url.searchParams.set('data', compressed);
        
        const shareURL = url.toString();
        
        // 入力欄に表示
        const input = document.getElementById('shareURLInput');
        input.value = shareURL;
        
        document.getElementById('urlDisplay').style.display = 'block';
        document.getElementById('dataDisplay').style.display = 'none';
        
        this.showNotification('共有URLを生成しました！', 'success');
    }

    loadFromJSON() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.importData(data);
                this.showNotification('データを読み込みました！', 'success');
                this.closeModal('saveModal');
            } catch (error) {
                console.error('ファイル読み込みエラー:', error);
                this.showNotification('データの読み込みに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }

    exportAsPDF() {
        // PDF出力は外部ライブラリ（jsPDF等）が必要なため、簡易実装
        this.showNotification('PDF出力機能は開発中です。現在は画像保存をご利用ください。', 'info');
    }

    exportData() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            shapes: window.shapes.map(s => s.toJSON()),
            points: window.points.map(p => p.toJSON()),
            canvasSize: {
                width: document.getElementById('mainCanvas').width,
                height: document.getElementById('mainCanvas').height
            }
        };
    }

    importData(data) {
        if (!data || !data.shapes) {
            throw new Error('無効なデータ形式です');
        }
        
        // 現在のデータをクリア
        window.shapes = [];
        window.points = [];
        
        // 図形を復元
        data.shapes.forEach(shapeData => {
            const shape = Shape.fromJSON(shapeData);
            window.shapes.push(shape);
        });
        
        // 点を復元
        if (data.points) {
            data.points.forEach(pointData => {
                const point = Point.fromJSON(pointData);
                window.points.push(point);
            });
        }
        
        // 再描画
        window.redraw();
        window.updateInfo();
    }

    compressData(data) {
        // 簡易的な圧縮（Base64エンコード）
        const jsonString = JSON.stringify(data);
        return btoa(encodeURIComponent(jsonString));
    }

    decompressData(compressed) {
        try {
            const jsonString = decodeURIComponent(atob(compressed));
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('データ展開エラー:', error);
            return null;
        }
    }

    loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const compressedData = urlParams.get('data');
        
        if (compressedData) {
            const data = this.decompressData(compressedData);
            if (data) {
                try {
                    this.importData(data);
                    this.showNotification('共有データを読み込みました！', 'success');
                } catch (error) {
                    console.error('URL読み込みエラー:', error);
                    this.showNotification('共有データの読み込みに失敗しました', 'error');
                }
            }
        }
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        element.select();
        document.execCommand('copy');
        
        this.showNotification('クリップボードにコピーしました！', 'success');
    }

    saveToLocalStorage() {
        const data = this.exportData();
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('ローカルストレージ保存エラー:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const dataString = localStorage.getItem(this.storageKey);
            if (dataString) {
                const data = JSON.parse(dataString);
                this.importData(data);
                return true;
            }
        } catch (error) {
            console.error('ローカルストレージ読み込みエラー:', error);
        }
        return false;
    }

    clearLocalStorage() {
        localStorage.removeItem(this.storageKey);
    }

    showNotification(message, type = 'info') {
        // 通知を表示する簡易実装
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }
}

// CSS アニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
