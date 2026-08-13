// ===== ツール機能 =====

class GeometryTools {
    static calculatePerpendicular(p1, p2, p3) {
        // p1-p2を結ぶ直線に対して、p3から垂線を下ろす
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        if (dx === 0 && dy === 0) return null;
        
        const t = ((p3.x - p1.x) * dx + (p3.y - p1.y) * dy) / (dx * dx + dy * dy);
        
        return new Point(
            p1.x + t * dx,
            p1.y + t * dy,
            { color: '#e74c3c', label: '垂線の足' }
        );
    }

    static calculateMidpoint(p1, p2) {
        return new Point(
            (p1.x + p2.x) / 2,
            (p1.y + p2.y) / 2,
            { color: '#e74c3c', size: 5, label: '中点' }
        );
    }

    static calculatePerpendicularBisector(p1, p2) {
        const mid = this.calculateMidpoint(p1, p2);
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        const length = 500;
        const angle = Math.atan2(-dx, dy);
        
        const start = new Point(
            mid.x + length * Math.cos(angle),
            mid.y + length * Math.sin(angle)
        );
        
        const end = new Point(
            mid.x - length * Math.cos(angle),
            mid.y - length * Math.sin(angle)
        );
        
        return { mid, start, end };
    }

    static calculateAngleBisector(p1, vertex, p2) {
        // vertexが頂点
        const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
        const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
        const bisectorAngle = (angle1 + angle2) / 2;
        
        const length = 500;
        const end = new Point(
            vertex.x + length * Math.cos(bisectorAngle),
            vertex.y + length * Math.sin(bisectorAngle)
        );
        
        return { vertex, end };
    }

    static calculateParallelLine(p1, p2, throughPoint) {
        // p1-p2に平行で、throughPointを通る直線
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        const length = 1000;
        const angle = Math.atan2(dy, dx);
        
        const start = new Point(
            throughPoint.x - length * Math.cos(angle),
            throughPoint.y - length * Math.sin(angle)
        );
        
        const end = new Point(
            throughPoint.x + length * Math.cos(angle),
            throughPoint.y + length * Math.sin(angle)
        );
        
        return { start, end };
    }

    static isRightAngle(p1, vertex, p2, tolerance = 1) {
        const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
        const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
        let angleDiff = Math.abs(angle2 - angle1) * 180 / Math.PI;
        
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        return Math.abs(angleDiff - 90) < tolerance;
    }

    static areParallel(p1, p2, p3, p4, tolerance = 0.01) {
        const slope1 = (p2.y - p1.y) / (p2.x - p1.x);
        const slope2 = (p4.y - p3.y) / (p4.x - p3.x);
        
        return Math.abs(slope1 - slope2) < tolerance;
    }

    static areCollinear(p1, p2, p3, tolerance = 0.5) {
        // 3点が一直線上にあるか
        const area = Math.abs(
            (p2.x - p1.x) * (p3.y - p1.y) - 
            (p3.x - p1.x) * (p2.y - p1.y)
        ) / 2;
        
        return area < tolerance;
    }

    static getTriangleType(shape) {
        if (shape.type !== 'triangle' || shape.points.length < 3) return null;
        
        const a = shape.points[1].distanceTo(shape.points[2]);
        const b = shape.points[0].distanceTo(shape.points[2]);
        const c = shape.points[0].distanceTo(shape.points[1]);
        
        const angles = shape.getAngles();
        
        let types = [];
        
        // 辺による分類
        if (Math.abs(a - b) < 0.5 && Math.abs(b - c) < 0.5) {
            types.push('正三角形');
        } else if (Math.abs(a - b) < 0.5 || Math.abs(b - c) < 0.5 || Math.abs(a - c) < 0.5) {
            types.push('二等辺三角形');
        } else {
            types.push('不等辺三角形');
        }
        
        // 角による分類
        if (angles.some(angle => Math.abs(angle - 90) < 1)) {
            types.push('直角三角形');
        } else if (angles.some(angle => angle > 90)) {
            types.push('鈍角三角形');
        } else {
            types.push('鋭角三角形');
        }
        
        return types;
    }

    static getQuadrilateralType(points) {
        if (points.length !== 4) return null;
        
        // 対辺の長さを計算
        const side1 = points[0].distanceTo(points[1]);
        const side2 = points[1].distanceTo(points[2]);
        const side3 = points[2].distanceTo(points[3]);
        const side4 = points[3].distanceTo(points[0]);
        
        // 対角線の長さ
        const diag1 = points[0].distanceTo(points[2]);
        const diag2 = points[1].distanceTo(points[3]);
        
        // 正方形
        if (Math.abs(side1 - side2) < 0.5 && 
            Math.abs(side2 - side3) < 0.5 && 
            Math.abs(side3 - side4) < 0.5 &&
            Math.abs(diag1 - diag2) < 0.5) {
            return '正方形';
        }
        
        // 長方形
        if (Math.abs(side1 - side3) < 0.5 && 
            Math.abs(side2 - side4) < 0.5 &&
            Math.abs(diag1 - diag2) < 0.5) {
            return '長方形';
        }
        
        // ひし形
        if (Math.abs(side1 - side2) < 0.5 && 
            Math.abs(side2 - side3) < 0.5 && 
            Math.abs(side3 - side4) < 0.5) {
            return 'ひし形';
        }
        
        // 平行四辺形
        if (Math.abs(side1 - side3) < 0.5 && 
            Math.abs(side2 - side4) < 0.5) {
            return '平行四辺形';
        }
        
        // 台形
        if (this.areParallel(points[0], points[1], points[2], points[3]) ||
            this.areParallel(points[1], points[2], points[3], points[0])) {
            return '台形';
        }
        
        return '四角形';
    }

    static getTheorems(shape) {
        let theorems = [];
        
        if (shape.type === 'triangle') {
            theorems.push({
                title: '三角形の内角の和',
                content: '三角形の3つの内角の和は常に180°である。',
                formula: '∠A + ∠B + ∠C = 180°'
            });
            
            const types = this.getTriangleType(shape);
            
            if (types.includes('正三角形')) {
                theorems.push({
                    title: '正三角形の性質',
                    content: '3つの辺が全て等しく、3つの角も全て60°である。',
                    formula: 'a = b = c, ∠A = ∠B = ∠C = 60°'
                });
            }
            
            if (types.includes('二等辺三角形')) {
                theorems.push({
                    title: '二等辺三角形の性質',
                    content: '2つの辺が等しく、その両端の角（底角）も等しい。',
                    formula: 'a = b ⇒ ∠A = ∠B'
                });
            }
            
            if (types.includes('直角三角形')) {
                theorems.push({
                    title: 'ピタゴラスの定理',
                    content: '直角三角形において、斜辺の2乗は他の2辺の2乗の和に等しい。',
                    formula: 'a² + b² = c²'
                });
            }
        }
        
        if (shape.type === 'circle') {
            theorems.push({
                title: '円の性質',
                content: '円周上の任意の点から中心までの距離は常に等しい（半径）。',
                formula: 'r = 一定'
            });
            
            theorems.push({
                title: '円の面積と円周',
                content: '円の面積はπr²、円周は2πrで表される。',
                formula: 'S = πr², C = 2πr'
            });
        }
        
        return theorems;
    }

    static drawRightAngleMark(ctx, corner, p1, p2, size = 15) {
        // 直角マークを描画
        const v1x = p1.x - corner.x;
        const v1y = p1.y - corner.y;
        const v2x = p2.x - corner.x;
        const v2y = p2.y - corner.y;
        
        const len1 = Math.sqrt(v1x**2 + v1y**2);
        const len2 = Math.sqrt(v2x**2 + v2y**2);
        
        if (len1 === 0 || len2 === 0) return;
        
        const u1x = v1x / len1 * size;
        const u1y = v1y / len1 * size;
        const u2x = v2x / len2 * size;
        const u2y = v2y / len2 * size;
        
        ctx.save();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(corner.x + u1x, corner.y + u1y);
        ctx.lineTo(corner.x + u1x + u2x, corner.y + u1y + u2y);
        ctx.lineTo(corner.x + u2x, corner.y + u2y);
        ctx.stroke();
        
        ctx.restore();
    }
}

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.GeometryTools = GeometryTools;
}
