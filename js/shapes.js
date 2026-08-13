// ===== 図形クラス定義 =====

class Point {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.id = this.generateId();
        this.type = 'point';
        this.draggable = options.draggable !== false;
        this.color = options.color || '#000000';
        this.size = options.size || 4;
        this.label = options.label || '';
        this.highlighted = false;
    }

    generateId() {
        return `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    draw(ctx) {
        ctx.save();
        
        // ハイライト効果
        if (this.highlighted) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // ドラッグ可能な点の枠
        if (this.draggable && window.dragMode) {
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 点本体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // ラベル
        if (this.label) {
            ctx.fillStyle = this.color;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(this.label, this.x + 10, this.y - 10);
        }

        ctx.restore();
    }

    distanceTo(point) {
        return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
    }

    isNear(x, y, threshold = 15) {
        return this.distanceTo({ x, y }) < threshold;
    }

    clone() {
        return new Point(this.x, this.y, {
            draggable: this.draggable,
            color: this.color,
            size: this.size,
            label: this.label
        });
    }

    toJSON() {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            color: this.color,
            size: this.size,
            label: this.label
        };
    }

    static fromJSON(data) {
        return new Point(data.x, data.y, {
            color: data.color,
            size: data.size,
            label: data.label
        });
    }
}

class Shape {
    constructor(type, points, options = {}) {
        this.type = type;
        this.points = points;
        this.id = this.generateId();
        this.color = options.color || '#3498db';
        this.lineWidth = options.lineWidth || 2;
        this.fillColor = options.fillColor || 'transparent';
        this.dashPattern = options.dashPattern || [];
        this.label = options.label || '';
        this.opacity = options.opacity || 1;
    }

    generateId() {
        return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillColor;
        
        if (this.dashPattern.length > 0) {
            ctx.setLineDash(this.dashPattern);
        }

        switch (this.type) {
            case 'segment':
                this.drawSegment(ctx);
                break;
            case 'line':
                this.drawLine(ctx);
                break;
            case 'ray':
                this.drawRay(ctx);
                break;
            case 'circle':
                this.drawCircle(ctx);
                break;
            case 'arc':
                this.drawArc(ctx);
                break;
            case 'ellipse':
                this.drawEllipse(ctx);
                break;
            case 'triangle':
                this.drawTriangle(ctx);
                break;
            case 'rectangle':
                this.drawRectangle(ctx);
                break;
            case 'polygon':
                this.drawPolygon(ctx);
                break;
            case 'regular-polygon':
                this.drawRegularPolygon(ctx);
                break;
        }

        ctx.restore();
    }

    drawSegment(ctx) {
        if (this.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.lineTo(this.points[1].x, this.points[1].y);
            ctx.stroke();

            // 中点マーク（オプション）
            if (this.showMidpoint) {
                const mid = this.getMidpoint();
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(mid.x, mid.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawLine(ctx) {
        if (this.points.length >= 2) {
            const p1 = this.points[0];
            const p2 = this.points[1];
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = 3000;
            const angle = Math.atan2(dy, dx);
            
            const x1 = p1.x - length * Math.cos(angle);
            const y1 = p1.y - length * Math.sin(angle);
            const x2 = p1.x + length * Math.cos(angle);
            const y2 = p1.y + length * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    drawRay(ctx) {
        if (this.points.length >= 2) {
            const p1 = this.points[0];
            const p2 = this.points[1];
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = 3000;
            const angle = Math.atan2(dy, dx);
            
            const x2 = p1.x + length * Math.cos(angle);
            const y2 = p1.y + length * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    drawCircle(ctx) {
        if (this.points.length >= 2) {
            const center = this.points[0];
            const radius = center.distanceTo(this.points[1]);
            
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }

            // 半径線（オプション）
            if (this.showRadius) {
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(center.x, center.y);
                ctx.lineTo(this.points[1].x, this.points[1].y);
                ctx.stroke();
            }
        }
    }

    drawArc(ctx) {
        if (this.points.length >= 3) {
            const center = this.points[0];
            const radius = center.distanceTo(this.points[1]);
            const startAngle = Math.atan2(this.points[1].y - center.y, this.points[1].x - center.x);
            const endAngle = Math.atan2(this.points[2].y - center.y, this.points[2].x - center.x);
            
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, startAngle, endAngle);
            ctx.stroke();
        }
    }

    drawEllipse(ctx) {
        if (this.points.length >= 2) {
            const center = this.points[0];
            const radiusX = Math.abs(this.points[1].x - center.x);
            const radiusY = Math.abs(this.points[1].y - center.y);
            
            ctx.beginPath();
            ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }
        }
    }

    drawTriangle(ctx) {
        if (this.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            ctx.lineTo(this.points[1].x, this.points[1].y);
            ctx.lineTo(this.points[2].x, this.points[2].y);
            ctx.closePath();
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }

            // 角度マーク（オプション）
            if (this.showAngles) {
                this.drawAngleMarks(ctx);
            }
        }
    }

    drawRectangle(ctx) {
        if (this.points.length >= 2) {
            const width = this.points[1].x - this.points[0].x;
            const height = this.points[1].y - this.points[0].y;
            
            ctx.beginPath();
            ctx.rect(this.points[0].x, this.points[0].y, width, height);
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }
        }
    }

    drawPolygon(ctx) {
        if (this.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            
            ctx.closePath();
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }
        }
    }

    drawRegularPolygon(ctx) {
        if (this.points.length >= 2 && this.sides) {
            const center = this.points[0];
            const radius = center.distanceTo(this.points[1]);
            const startAngle = Math.atan2(this.points[1].y - center.y, this.points[1].x - center.x);
            
            ctx.beginPath();
            
            for (let i = 0; i <= this.sides; i++) {
                const angle = startAngle + (i * 2 * Math.PI / this.sides);
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            if (this.fillColor !== 'transparent') {
                ctx.fill();
            }
        }
    }

    drawAngleMarks(ctx) {
        // 三角形の角度マークを描画
        const arcRadius = 20;
        
        for (let i = 0; i < 3; i++) {
            const prev = this.points[(i + 2) % 3];
            const curr = this.points[i];
            const next = this.points[(i + 1) % 3];
            
            const angle1 = Math.atan2(prev.y - curr.y, prev.x - curr.x);
            const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
            
            ctx.beginPath();
            ctx.arc(curr.x, curr.y, arcRadius, angle1, angle2);
            ctx.stroke();
        }
    }

    getMidpoint() {
        if (this.points.length >= 2) {
            return {
                x: (this.points[0].x + this.points[1].x) / 2,
                y: (this.points[0].y + this.points[1].y) / 2
            };
        }
        return null;
    }

    getLength() {
        if (this.type === 'segment' && this.points.length >= 2) {
            return this.points[0].distanceTo(this.points[1]);
        }
        return 0;
    }

    getArea() {
        if (this.type === 'circle' && this.points.length >= 2) {
            const radius = this.points[0].distanceTo(this.points[1]);
            return Math.PI * radius ** 2;
        }
        
        if (this.type === 'triangle' && this.points.length >= 3) {
            const a = this.points[1].distanceTo(this.points[2]);
            const b = this.points[0].distanceTo(this.points[2]);
            const c = this.points[0].distanceTo(this.points[1]);
            const s = (a + b + c) / 2;
            return Math.sqrt(s * (s - a) * (s - b) * (s - c));
        }
        
        if (this.type === 'rectangle' && this.points.length >= 2) {
            const width = Math.abs(this.points[1].x - this.points[0].x);
            const height = Math.abs(this.points[1].y - this.points[0].y);
            return width * height;
        }
        
        if (this.type === 'polygon' && this.points.length >= 3) {
            // 多角形の面積（靴紐公式）
            let area = 0;
            for (let i = 0; i < this.points.length; i++) {
                const j = (i + 1) % this.points.length;
                area += this.points[i].x * this.points[j].y;
                area -= this.points[j].x * this.points[i].y;
            }
            return Math.abs(area / 2);
        }
        
        return 0;
    }

    getPerimeter() {
        if (this.type === 'circle' && this.points.length >= 2) {
            const radius = this.points[0].distanceTo(this.points[1]);
            return 2 * Math.PI * radius;
        }
        
        if (this.type === 'triangle' && this.points.length >= 3) {
            const a = this.points[1].distanceTo(this.points[2]);
            const b = this.points[0].distanceTo(this.points[2]);
            const c = this.points[0].distanceTo(this.points[1]);
            return a + b + c;
        }
        
        if (this.type === 'rectangle' && this.points.length >= 2) {
            const width = Math.abs(this.points[1].x - this.points[0].x);
            const height = Math.abs(this.points[1].y - this.points[0].y);
            return 2 * (width + height);
        }
        
        if (this.type === 'polygon' && this.points.length >= 3) {
            let perimeter = 0;
            for (let i = 0; i < this.points.length; i++) {
                const j = (i + 1) % this.points.length;
                perimeter += this.points[i].distanceTo(this.points[j]);
            }
            return perimeter;
        }
        
        return 0;
    }

    getAngles() {
        if (this.type === 'triangle' && this.points.length >= 3) {
            const a = this.points[1].distanceTo(this.points[2]);
            const b = this.points[0].distanceTo(this.points[2]);
            const c = this.points[0].distanceTo(this.points[1]);
            
            const angleA = Math.acos((b**2 + c**2 - a**2) / (2 * b * c)) * 180 / Math.PI;
            const angleB = Math.acos((a**2 + c**2 - b**2) / (2 * a * c)) * 180 / Math.PI;
            const angleC = 180 - angleA - angleB;
            
            return [angleA, angleB, angleC];
        }
        return [];
    }

    getInfo() {
        let info = `<p><strong>【${this.getTypeName()}】</strong></p>`;
        
        if (this.type === 'segment') {
            const length = this.getLength();
            info += `<p>長さ: ${length.toFixed(2)}</p>`;
            const mid = this.getMidpoint();
            info += `<p>中点: (${mid.x.toFixed(1)}, ${mid.y.toFixed(1)})</p>`;
        }
        
        if (this.type === 'circle') {
            const radius = this.points[0].distanceTo(this.points[1]);
            const area = this.getArea();
            const perimeter = this.getPerimeter();
            info += `<p>半径: ${radius.toFixed(2)}</p>`;
            info += `<p>直径: ${(2 * radius).toFixed(2)}</p>`;
            info += `<p>円周: ${perimeter.toFixed(2)}</p>`;
            info += `<p>面積: ${area.toFixed(2)}</p>`;
        }
        
        if (this.type === 'triangle') {
            const angles = this.getAngles();
            const area = this.getArea();
            const perimeter = this.getPerimeter();
            
            info += `<p>辺の長さ:</p>`;
            info += `<p>a = ${this.points[1].distanceTo(this.points[2]).toFixed(2)}</p>`;
            info += `<p>b = ${this.points[0].distanceTo(this.points[2]).toFixed(2)}</p>`;
            info += `<p>c = ${this.points[0].distanceTo(this.points[1]).toFixed(2)}</p>`;
            info += `<p><br>角度:</p>`;
            info += `<p>∠A = ${angles[0].toFixed(1)}°</p>`;
            info += `<p>∠B = ${angles[1].toFixed(1)}°</p>`;
            info += `<p>∠C = ${angles[2].toFixed(1)}°</p>`;
            info += `<p><br>周の長さ: ${perimeter.toFixed(2)}</p>`;
            info += `<p>面積: ${area.toFixed(2)}</p>`;
        }
        
        if (this.type === 'rectangle') {
            const width = Math.abs(this.points[1].x - this.points[0].x);
            const height = Math.abs(this.points[1].y - this.points[0].y);
            const area = this.getArea();
            const perimeter = this.getPerimeter();
            
            info += `<p>幅: ${width.toFixed(2)}</p>`;
            info += `<p>高さ: ${height.toFixed(2)}</p>`;
            info += `<p>周の長さ: ${perimeter.toFixed(2)}</p>`;
            info += `<p>面積: ${area.toFixed(2)}</p>`;
        }
        
        if (this.type === 'polygon') {
            const area = this.getArea();
            const perimeter = this.getPerimeter();
            info += `<p>頂点数: ${this.points.length}</p>`;
            info += `<p>周の長さ: ${perimeter.toFixed(2)}</p>`;
            info += `<p>面積: ${area.toFixed(2)}</p>`;
        }
        
        return info;
    }

    getTypeName() {
        const names = {
            'segment': '線分',
            'line': '直線',
            'ray': '半直線',
            'circle': '円',
            'arc': '弧',
            'ellipse': '楕円',
            'triangle': '三角形',
            'rectangle': '長方形',
            'polygon': '多角形',
            'regular-polygon': '正多角形'
        };
        return names[this.type] || this.type;
    }

    clone() {
        const clonedPoints = this.points.map(p => p.clone());
        return new Shape(this.type, clonedPoints, {
            color: this.color,
            lineWidth: this.lineWidth,
            fillColor: this.fillColor,
            dashPattern: this.dashPattern,
            label: this.label,
            opacity: this.opacity
        });
    }

    toJSON() {
        return {
            type: this.type,
            points: this.points.map(p => p.toJSON()),
            color: this.color,
            lineWidth: this.lineWidth,
            fillColor: this.fillColor,
            dashPattern: this.dashPattern,
            label: this.label,
            opacity: this.opacity,
            sides: this.sides
        };
    }

    static fromJSON(data) {
        const points = data.points.map(p => Point.fromJSON(p));
        const shape = new Shape(data.type, points, {
            color: data.color,
            lineWidth: data.lineWidth,
            fillColor: data.fillColor,
            dashPattern: data.dashPattern,
            label: data.label,
            opacity: data.opacity
        });
        if (data.sides) shape.sides = data.sides;
        return shape;
    }
}

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.Point = Point;
    window.Shape = Shape;
}
