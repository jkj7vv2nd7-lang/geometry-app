// ===== メインアプリケーション =====

class GeometryApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // グローバル変数
        this.currentTool = 'point';
        this.shapes = [];
        this.points = [];
        this.tempPoints = [];
        this.dragMode = false;
        this.traceMode = false;
        this.draggedPoint = null;
        this.tracePoints = [];
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // コントローラー
        this.animationController = new AnimationController();
        this.proofSystem = new ProofSystem();
        this.storageManager = new StorageManager();
        
        // グローバルにエクスポート（他のファイルからアクセスできるように）
        window.shapes = this.shapes;
        window.points = this.points;
        window.dragMode = this.dragMode;
        window.redraw = () => this.redraw();
        window.updateInfo = () => this.updateInfo();
    }

    init() {
        // キャンバスサイズを設定
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // コントローラーを初期化
        this.animationController.init();
        this.proofSystem.init();
        this.storageManager.init();
        
        // 初期描画
        this.redraw();
        
        console.log('📐 図形探求アプリが起動しました！');
    }

    setupEventListeners() {
        // ツールボタン
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTool(e.target.dataset.tool);
                this.updateActiveButton(e.target, '.tool-btn');
            });
        });

        // 特殊ボタン
        document.getElementById('dragModeBtn').addEventListener('click', () => this.toggleDragMode());
        document.getElementById('traceModeBtn').addEventListener('click', () => this.toggleTraceMode());
        document.getElementById('measureBtn').addEventListener('click', () => this.activateMeasureTool());

        // アクションボタン
        document.getElementById('animationBtn').addEventListener('click', () => this.openModal('animationModal'));
        document.getElementById('proofBtn').addEventListener('click', () => this.openModal('proofModal'));
        document.getElementById('saveBtn').addEventListener('click', () => this.openModal('saveModal'));
        document.getElementById('loadBtn').addEventListener('click', () => this.storageManager.loadFromJSON());
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.openModal('saveModal');
            setTimeout(() => this.storageManager.generateShareURL(), 100);
        });
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());

        // ヘルプボタン
        document.getElementById('helpBtn').addEventListener('click', () => this.openModal('helpModal'));

        // モーダルを閉じる
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.closeModal(modalId);
            });
        });

        // モーダルの外側をクリックで閉じる
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
                this.updateActiveButton(e.target, '.tab-btn');
            });
        });

        // キャンバスイベント
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));

        // 履歴ボタン
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // 軌跡クリアボタン
        document.getElementById('clearTraceBtn').addEventListener('click', () => this.clearTrace());

        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    resizeCanvas() {
        const canvasArea = this.canvas.parentElement;
        this.canvas.width = canvasArea.clientWidth;
        this.canvas.height = canvasArea.clientHeight;
        this.redraw();
    }

    setTool(tool) {
        this.currentTool = tool;
        this.tempPoints = [];
        document.getElementById('currentTool').textContent = `ツール: ${this.getToolName(tool)}`;
    }

    getToolName(tool) {
        const names = {
            'point': '点',
            'line': '直線',
            'segment': '線分',
            'ray': '半直線',
            'circle': '円',
            'arc': '弧',
            'ellipse': '楕円',
            'triangle': '三角形',
            'rectangle': '長方形',
            'polygon': '多角形',
            'regular-polygon': '正多角形',
            'perpendicular': '垂線',
            'parallel': '平行線',
            'midpoint': '中点',
            'bisector': '垂直二等分線',
            'angle-bisector': '角の二等分線'
        };
        return names[tool] || tool;
    }

    toggleDragMode() {
        this.dragMode = !this.dragMode;
        window.dragMode = this.dragMode;
        
        const btn = document.getElementById('dragModeBtn');
        const status = document.getElementById('dragMode');
        
        if (this.dragMode) {
            btn.classList.add('active');
            status.textContent = 'ドラッグ: ON';
            this.canvas.style.cursor = 'grab';
        } else {
            btn.classList.remove('active');
            status.textContent = 'ドラッグ: OFF';
            this.canvas.style.cursor = 'crosshair';
        }
        
        this.redraw();
    }

    toggleTraceMode() {
        this.traceMode = !this.traceMode;
        
        const btn = document.getElementById('traceModeBtn');
        const status = document.getElementById('traceMode');
        const traceStatus = document.getElementById('traceStatus');
        
        if (this.traceMode) {
            btn.classList.add('active');
            status.textContent = '軌跡: ON';
            traceStatus.textContent = 'ON';
            traceStatus.style.color = '#e74c3c';
        } else {
            btn.classList.remove('active');
            status.textContent = '軌跡: OFF';
            traceStatus.textContent = 'OFF';
            traceStatus.style.color = '';
        }
    }

    activateMeasureTool() {
        alert('測定ツール機能は開発中です。現在は自動的に図形の測定値が表示されます。');
    }

    clearTrace() {
        this.tracePoints = [];
        document.getElementById('traceCount').textContent = '0';
        this.redraw();
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = new Point(x, y);
        
        if (this.dragMode) {
            // ドラッグモード：近くの点を探す
            const nearPoint = this.findNearestPoint(x, y, 15);
            if (nearPoint) {
                this.draggedPoint = nearPoint;
                this.canvas.style.cursor = 'grabbing';
            }
        } else {
            // 通常の作図モード
            this.handleToolClick(point);
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 座標表示を更新
        document.getElementById('mouseCoords').textContent = `座標: (${Math.round(x)}, ${Math.round(y)})`;
        
        if (this.draggedPoint) {
            // 点をドラッグ中
            this.draggedPoint.x = x;
            this.draggedPoint.y = y;
            
            // 軌跡記録
            if (this.traceMode) {
                this.tracePoints.push({ x, y, timestamp: Date.now() });
                document.getElementById('traceCount').textContent = this.tracePoints.length;
            }
            
            this.redraw();
            this.updateInfo();
        } else if (this.tempPoints.length > 0 && !this.dragMode) {
            // プレビュー表示
            this.redraw();
            this.drawPreview(x, y);
        }
    }

    onMouseUp(e) {
        if (this.draggedPoint) {
            this.addToHistory();
            this.draggedPoint = null;
            this.canvas.style.cursor = this.dragMode ? 'grab' : 'crosshair';
        }
    }

    handleToolClick(point) {
        switch (this.currentTool) {
            case 'point':
                this.points.push(point);
                this.addToHistory();
                break;
                
            case 'segment':
            case 'line':
            case 'ray':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const shape = new Shape(this.currentTool, [...this.tempPoints]);
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                    this.updateInfo();
                }
                break;
                
            case 'circle':
            case 'ellipse':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const shape = new Shape(this.currentTool, [...this.tempPoints]);
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                    this.updateInfo();
                }
                break;
                
            case 'arc':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 3) {
                    const shape = new Shape('arc', [...this.tempPoints]);
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                    this.updateInfo();
                }
                break;
                
            case 'triangle':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 3) {
                    const shape = new Shape('triangle', [...this.tempPoints]);
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                    this.updateInfo();
                    this.showTriangleTheorems(shape);
                }
                break;
                
            case 'rectangle':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const shape = new Shape('rectangle', [...this.tempPoints]);
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                    this.updateInfo();
                }
                break;
                
            case 'polygon':
                this.tempPoints.push(point);
                // ダブルクリックまたは開始点の近くをクリックで完了
                if (this.tempPoints.length >= 3) {
                    const firstPoint = this.tempPoints[0];
                    if (point.distanceTo(firstPoint) < 15) {
                        const shape = new Shape('polygon', [...this.tempPoints]);
                        this.shapes.push(shape);
                        this.tempPoints = [];
                        this.addToHistory();
                        this.updateInfo();
                    }
                }
                break;
                
            case 'regular-polygon':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const sides = parseInt(prompt('正多角形の辺の数を入力してください（3以上）:', '6'));
                    if (sides && sides >= 3) {
                        const shape = new Shape('regular-polygon', [...this.tempPoints]);
                        shape.sides = sides;
                        this.shapes.push(shape);
                        this.tempPoints = [];
                        this.addToHistory();
                        this.updateInfo();
                    } else {
                        this.tempPoints = [];
                    }
                }
                break;
                
            case 'midpoint':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const mid = GeometryTools.calculateMidpoint(this.tempPoints[0], this.tempPoints[1]);
                    this.points.push(mid);
                    
                    // 線分も描画
                    const shape = new Shape('segment', [...this.tempPoints], { color: '#95a5a6', dashPattern: [5, 5] });
                    this.shapes.push(shape);
                    
                    this.tempPoints = [];
                    this.addToHistory();
                }
                break;
                
            case 'perpendicular':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 3) {
                    const foot = GeometryTools.calculatePerpendicular(
                        this.tempPoints[0], 
                        this.tempPoints[1], 
                        this.tempPoints[2]
                    );
                    if (foot) {
                        this.points.push(foot);
                        const shape = new Shape('segment', [this.tempPoints[2], foot], { color: '#e74c3c' });
                        this.shapes.push(shape);
                    }
                    this.tempPoints = [];
                    this.addToHistory();
                }
                break;
                
            case 'bisector':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 2) {
                    const result = GeometryTools.calculatePerpendicularBisector(
                        this.tempPoints[0], 
                        this.tempPoints[1]
                    );
                    this.points.push(result.mid);
                    const shape = new Shape('line', [result.start, result.end], { color: '#2ecc71' });
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                }
                break;
                
            case 'angle-bisector':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 3) {
                    const result = GeometryTools.calculateAngleBisector(
                        this.tempPoints[0], 
                        this.tempPoints[1], 
                        this.tempPoints[2]
                    );
                    const shape = new Shape('line', [result.vertex, result.end], { color: '#9b59b6' });
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                }
                break;
                
            case 'parallel':
                this.tempPoints.push(point);
                if (this.tempPoints.length === 3) {
                    const result = GeometryTools.calculateParallelLine(
                        this.tempPoints[0], 
                        this.tempPoints[1], 
                        this.tempPoints[2]
                    );
                    const shape = new Shape('line', [result.start, result.end], { color: '#f39c12' });
                    this.shapes.push(shape);
                    this.tempPoints = [];
                    this.addToHistory();
                }
                break;
        }
        
        this.redraw();
        this.updateObjectCount();
    }

    drawPreview(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 1;
        
        if ((this.currentTool === 'segment' || this.currentTool === 'line' || this.currentTool === 'ray') && this.tempPoints.length === 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if ((this.currentTool === 'circle' || this.currentTool === 'regular-polygon') && this.tempPoints.length === 1) {
            const radius = this.tempPoints[0].distanceTo({ x, y });
            this.ctx.beginPath();
            this.ctx.arc(this.tempPoints[0].x, this.tempPoints[0].y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (this.currentTool === 'ellipse' && this.tempPoints.length === 1) {
            const radiusX = Math.abs(x - this.tempPoints[0].x);
            const radiusY = Math.abs(y - this.tempPoints[0].y);
            this.ctx.beginPath();
            this.ctx.ellipse(this.tempPoints[0].x, this.tempPoints[0].y, radiusX, radiusY, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        } else if (this.currentTool === 'rectangle' && this.tempPoints.length === 1) {
            const width = x - this.tempPoints[0].x;
            const height = y - this.tempPoints[0].y;
            this.ctx.strokeRect(this.tempPoints[0].x, this.tempPoints[0].y, width, height);
        } else if ((this.currentTool === 'triangle' || this.currentTool === 'polygon' || this.currentTool === 'arc') && this.tempPoints.length >= 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);
            for (let i = 1; i < this.tempPoints.length; i++) {
                this.ctx.lineTo(this.tempPoints[i].x, this.tempPoints[i].y);
            }
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    redraw() {
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッドを描画
        this.drawGrid();
        
        // 軌跡を描画
        this.drawTrace();
        
        // 図形を描画
        this.shapes.forEach(shape => shape.draw(this.ctx));
        
        // 点を描画
        this.points.forEach(point => point.draw(this.ctx));
        
        // 一時的な点を描画
        this.tempPoints.forEach(point => {
            this.ctx.fillStyle = '#3498db';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 1;
        
        const gridSize = 20;
        
        // 縦線
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // 中心軸
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 2;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.canvas.width, centerY);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawTrace() {
        if (this.tracePoints.length === 0) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(231, 76, 60, 0.4)';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.tracePoints[0].x, this.tracePoints[0].y);
        
        for (let i = 1; i < this.tracePoints.length; i++) {
            this.ctx.lineTo(this.tracePoints[i].x, this.tracePoints[i].y);
        }
        
        this.ctx.stroke();
        
        // 軌跡上の点
        this.tracePoints.forEach((p, i) => {
            if (i % 10 === 0) {
                this.ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.restore();
    }

    findNearestPoint(x, y, threshold) {
        let nearest = null;
        let minDist = threshold;
        
        // すべての点をチェック
        this.points.forEach(p => {
            const dist = p.distanceTo({ x, y });
            if (dist < minDist) {
                minDist = dist;
                nearest = p;
            }
        });
        
        // 図形の頂点もチェック
        this.shapes.forEach(shape => {
            shape.points.forEach(p => {
                const dist = p.distanceTo({ x, y });
                if (dist < minDist) {
                    minDist = dist;
                    nearest = p;
                }
            });
        });
        
        return nearest;
    }

    updateInfo() {
        if (this.shapes.length === 0) {
            document.getElementById('shapeInfo').innerHTML = '<p class="placeholder">図形を描画すると詳細情報が表示されます</p>';
            return;
        }
        
        const lastShape = this.shapes[this.shapes.length - 1];
        document.getElementById('shapeInfo').innerHTML = lastShape.getInfo();
        
        this.updateMeasurements(lastShape);
        this.updateTheorems(lastShape);
    }

    updateMeasurements(shape) {
        const length = shape.getLength();
        const area = shape.getArea();
        const perimeter = shape.getPerimeter();
        
        document.getElementById('distanceValue').textContent = length > 0 ? length.toFixed(2) : '-';
        document.getElementById('areaValue').textContent = area > 0 ? area.toFixed(2) : '-';
        document.getElementById('perimeterValue').textContent = perimeter > 0 ? perimeter.toFixed(2) : '-';
        
        if (shape.type === 'triangle') {
            const angles = shape.getAngles();
            if (angles.length > 0) {
                document.getElementById('angleValue').textContent = `${angles[0].toFixed(1)}°, ${angles[1].toFixed(1)}°, ${angles[2].toFixed(1)}°`;
            }
        } else {
            document.getElementById('angleValue').textContent = '-';
        }
    }

    updateTheorems(shape) {
        const theorems = GeometryTools.getTheorems(shape);
        
        if (theorems.length === 0) {
            document.getElementById('theoremInfo').innerHTML = '<p class="placeholder">図形の性質や定理がここに表示されます</p>';
            return;
        }
        
        let html = '';
        theorems.forEach(theorem => {
            html += `
                <div class="theorem-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="margin-bottom: 8px;">${theorem.title}</h4>
                    <p style="margin: 5px 0; font-size: 14px;">${theorem.content}</p>
                    ${theorem.formula ? `<p style="margin-top: 8px; font-weight: bold; font-size: 16px;">${theorem.formula}</p>` : ''}
                </div>
            `;
        });
        
        document.getElementById('theoremInfo').innerHTML = html;
    }

    showTriangleTheorems(shape) {
        const types = GeometryTools.getTriangleType(shape);
        if (types) {
            console.log('三角形のタイプ:', types);
        }
    }

    updateObjectCount() {
        const totalPoints = this.points.length;
        const totalShapes = this.shapes.length;
        document.getElementById('objectCount').textContent = `オブジェクト: ${totalPoints + totalShapes}`;
    }

    clearCanvas() {
        if (this.shapes.length === 0 && this.points.length === 0) return;
        
        if (confirm('すべての図形をクリアしますか？')) {
            this.shapes = [];
            this.points = [];
            this.tempPoints = [];
            this.tracePoints = [];
            this.history = [];
            this.historyIndex = -1;
            
            window.shapes = this.shapes;
            window.points = this.points;
            
            this.redraw();
            
            document.getElementById('shapeInfo').innerHTML = '<p class="placeholder">図形を描画すると詳細情報が表示されます</p>';
            document.getElementById('theoremInfo').innerHTML = '<p class="placeholder">図形の性質や定理がここに表示されます</p>';
            document.getElementById('distanceValue').textContent = '-';
            document.getElementById('angleValue').textContent = '-';
            document.getElementById('areaValue').textContent = '-';
            document.getElementById('perimeterValue').textContent = '-';
            document.getElementById('traceCount').textContent = '0';
            
            this.updateObjectCount();
        }
    }

    addToHistory() {
        // 現在の状態を履歴に追加
        const state = {
            shapes: this.shapes.map(s => s.toJSON()),
            points: this.points.map(p => p.toJSON()),
            timestamp: Date.now()
        };
        
        // 現在位置より後の履歴を削除
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 新しい状態を追加
        this.history.push(state);
        
        // 最大履歴数を超えたら古いものを削除
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.updateHistoryUI();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        this.shapes = state.shapes.map(s => Shape.fromJSON(s));
        this.points = state.points.map(p => Point.fromJSON(p));
        
        window.shapes = this.shapes;
        window.points = this.points;
        
        this.redraw();
        this.updateInfo();
        this.updateObjectCount();
    }

    updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="placeholder">操作履歴がありません</p>';
            return;
        }
        
        let html = '';
        this.history.forEach((state, index) => {
            const date = new Date(state.timestamp);
            const timeStr = date.toLocaleTimeString('ja-JP');
            const isActive = index === this.historyIndex;
            
            html += `
                <div class="history-item ${isActive ? 'active' : ''}" onclick="app.jumpToHistory(${index})">
                    <strong>${timeStr}</strong> - 図形: ${state.shapes.length}, 点: ${state.points.length}
                </div>
            `;
        });
        
        historyList.innerHTML = html;
    }

    jumpToHistory(index) {
        this.historyIndex = index;
        this.restoreState(this.history[index]);
    }

    handleKeyboard(e) {
        // Ctrl+Z: 元に戻す
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl+Y: やり直す
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        
        // Ctrl+S: 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.storageManager.saveAsJSON();
        }
        
        // Delete: 選択したオブジェクトを削除（今後実装）
        if (e.key === 'Delete') {
            // 選択機能を実装後に追加
        }
        
        // Escape: 現在の操作をキャンセル
        if (e.key === 'Escape') {
            this.tempPoints = [];
            this.redraw();
        }
    }

    switchTab(tabName) {
        // すべてのタブコンテンツを非表示
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 選択したタブを表示
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    updateActiveButton(activeBtn, selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }
}

// アプリケーションの起動
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new GeometryApp();
    app.init();
    
    // グローバルにエクスポート（デバッグ用）
    window.app = app;
});
