// ===== 証明機能 =====

class ProofSystem {
    constructor() {
        this.currentProof = null;
        this.currentStep = 0;
        this.proofs = this.initializeProofs();
    }

    init() {
        document.getElementById('theoremSelect').addEventListener('change', (e) => {
            this.loadProof(e.target.value);
        });

        document.getElementById('prevProofStep').addEventListener('click', () => this.previousStep());
        document.getElementById('nextProofStep').addEventListener('click', () => this.nextStep());
    }

    initializeProofs() {
        return {
            'triangle-angles': {
                title: '三角形の内角の和',
                steps: [
                    {
                        title: '定理',
                        content: '任意の三角形において、3つの内角の和は180°である。',
                        diagram: 'triangle-basic'
                    },
                    {
                        title: '証明の準備',
                        content: '△ABCにおいて、頂点Aを通り、辺BCに平行な直線ℓを引く。',
                        diagram: 'triangle-parallel'
                    },
                    {
                        title: 'ステップ1：錯角の利用',
                        content: '直線ℓとBCは平行なので、錯角は等しい。\n∠BAC = ∠1（錯角）\n∠ACB = ∠2（錯角）',
                        diagram: 'triangle-angles-marked'
                    },
                    {
                        title: 'ステップ2：平角の性質',
                        content: '点Aにおいて、∠1 + ∠BAC + ∠2 = 180°（平角）',
                        diagram: 'triangle-straight-angle'
                    },
                    {
                        title: '結論',
                        content: 'したがって、∠ABC + ∠BAC + ∠ACB = 180°\n三角形の内角の和は180°である。（証明終）',
                        diagram: 'triangle-conclusion'
                    }
                ]
            },
            'pythagorean': {
                title: 'ピタゴラスの定理',
                steps: [
                    {
                        title: '定理',
                        content: '直角三角形において、斜辺の2乗は他の2辺の2乗の和に等しい。\na² + b² = c²',
                        diagram: 'right-triangle'
                    },
                    {
                        title: '証明方法（面積による証明）',
                        content: '1辺が (a+b) の正方形を考える。その中に直角三角形4つと正方形1つが含まれる。',
                        diagram: 'pythagorean-square'
                    },
                    {
                        title: 'ステップ1：大きい正方形の面積',
                        content: '大きい正方形の面積 = (a + b)²',
                        diagram: 'pythagorean-outer'
                    },
                    {
                        title: 'ステップ2：内部の図形の面積',
                        content: '直角三角形4つの面積 = 4 × (1/2)ab = 2ab\n中央の正方形の面積 = c²',
                        diagram: 'pythagorean-inner'
                    },
                    {
                        title: 'ステップ3：等式を立てる',
                        content: '(a + b)² = 2ab + c²\na² + 2ab + b² = 2ab + c²\na² + b² = c²',
                        diagram: 'pythagorean-equation'
                    },
                    {
                        title: '結論',
                        content: 'したがって、直角三角形において a² + b² = c² が成り立つ。（証明終）',
                        diagram: 'pythagorean-conclusion'
                    }
                ]
            },
            'circle-angles': {
                title: '円周角の定理',
                steps: [
                    {
                        title: '定理',
                        content: '1つの弧に対する円周角は、その弧に対する中心角の半分である。',
                        diagram: 'circle-angle-basic'
                    },
                    {
                        title: '証明の準備',
                        content: '円Oにおいて、弧ABに対する円周角∠ACBと中心角∠AOBを考える。',
                        diagram: 'circle-setup'
                    },
                    {
                        title: 'ステップ1：補助線を引く',
                        content: '点Cと中心Oを結ぶ。△OACと△OCBは二等辺三角形である。',
                        diagram: 'circle-auxiliary'
                    },
                    {
                        title: 'ステップ2：二等辺三角形の性質',
                        content: 'OA = OC より、∠OAC = ∠OCA = α\nOB = OC より、∠OBC = ∠OCB = β',
                        diagram: 'circle-isosceles'
                    },
                    {
                        title: 'ステップ3：外角の定理',
                        content: '△OACにおいて、∠AOE = 2α（外角）\n△OBCにおいて、∠BOE = 2β（外角）',
                        diagram: 'circle-exterior'
                    },
                    {
                        title: '結論',
                        content: '∠AOB = 2α + 2β = 2(α + β) = 2∠ACB\n円周角は中心角の半分である。（証明終）',
                        diagram: 'circle-conclusion'
                    }
                ]
            },
            'parallel-angles': {
                title: '平行線の錯角',
                steps: [
                    {
                        title: '定理',
                        content: '2本の平行な直線に別の直線が交わるとき、錯角は等しい。',
                        diagram: 'parallel-basic'
                    },
                    {
                        title: '証明の準備',
                        content: '直線ℓとmが平行で、直線nがこれらと交わる。∠1と∠2は錯角である。',
                        diagram: 'parallel-setup'
                    },
                    {
                        title: 'ステップ1：対頂角',
                        content: '∠1と∠3は対頂角なので、∠1 = ∠3',
                        diagram: 'parallel-vertical'
                    },
                    {
                        title: 'ステップ2：同位角',
                        content: 'ℓ∥mより、同位角は等しいので、∠3 = ∠2',
                        diagram: 'parallel-corresponding'
                    },
                    {
                        title: '結論',
                        content: '∠1 = ∠3 = ∠2\nしたがって、錯角は等しい。（証明終）',
                        diagram: 'parallel-conclusion'
                    }
                ]
            },
            'midpoint': {
                title: '中点連結定理',
                steps: [
                    {
                        title: '定理',
                        content: '三角形の2辺の中点を結ぶ線分は、残りの1辺に平行で、その長さは半分である。',
                        diagram: 'midpoint-basic'
                    },
                    {
                        title: '証明の準備',
                        content: '△ABCにおいて、M、NをAB、ACの中点とする。MNとBCの関係を調べる。',
                        diagram: 'midpoint-setup'
                    },
                    {
                        title: 'ステップ1：補助線',
                        content: 'Nを通りABに平行な直線を引き、BCとの交点をPとする。',
                        diagram: 'midpoint-auxiliary'
                    },
                    {
                        title: 'ステップ2：相似な三角形',
                        content: '△ABCと△NPCにおいて、AB∥NPより、∠BAC = ∠PNC（同位角）',
                        diagram: 'midpoint-similar'
                    },
                    {
                        title: 'ステップ3：中点の性質',
                        content: 'AM = MB、AN = NCより、MN = (1/2)BC',
                        diagram: 'midpoint-calculation'
                    },
                    {
                        title: '結論',
                        content: 'MN∥BC かつ MN = (1/2)BC\n中点連結定理が成り立つ。（証明終）',
                        diagram: 'midpoint-conclusion'
                    }
                ]
            }
        };
    }

    loadProof(proofId) {
        if (!proofId) {
            document.getElementById('proofContent').innerHTML = '<p class="placeholder">定理を選択してください。</p>';
            return;
        }

        this.currentProof = this.proofs[proofId];
        this.currentStep = 0;
        this.displayStep();
    }

    displayStep() {
        if (!this.currentProof) return;

        const step = this.currentProof.steps[this.currentStep];
        const totalSteps = this.currentProof.steps.length;

        // ステップ内容を表示
        let html = `
            <div class="proof-step active">
                <h4>${step.title}</h4>
                <p style="white-space: pre-line; margin-top: 10px;">${step.content}</p>
            </div>
        `;

        // 以前のステップも表示（非アクティブ）
        for (let i = 0; i < this.currentStep; i++) {
            const prevStep = this.currentProof.steps[i];
            html = `
                <div class="proof-step">
                    <h4>${prevStep.title}</h4>
                    <p style="white-space: pre-line; margin-top: 10px;">${prevStep.content}</p>
                </div>
            ` + html;
        }

        document.getElementById('proofContent').innerHTML = html;
        document.getElementById('proofStepIndicator').textContent = `ステップ ${this.currentStep + 1} / ${totalSteps}`;

        // 図を描画
        this.drawProofDiagram(step.diagram);
    }

    nextStep() {
        if (!this.currentProof) return;
        
        if (this.currentStep < this.currentProof.steps.length - 1) {
            this.currentStep++;
            this.displayStep();
        }
    }

    previousStep() {
        if (!this.currentProof) return;
        
        if (this.currentStep > 0) {
            this.currentStep--;
            this.displayStep();
        }
    }

    drawProofDiagram(diagramType) {
        const canvas = document.getElementById('proofCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth - 40;
        canvas.height = 300;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // 中心に配置
        ctx.translate(canvas.width / 2, canvas.height / 2);

        switch (diagramType) {
            case 'triangle-basic':
                this.drawTriangleDiagram(ctx);
                break;
            case 'triangle-parallel':
                this.drawTriangleParallelDiagram(ctx);
                break;
            case 'right-triangle':
                this.drawRightTriangleDiagram(ctx);
                break;
            case 'pythagorean-square':
                this.drawPythagoreanSquareDiagram(ctx);
                break;
            case 'circle-angle-basic':
                this.drawCircleAngleDiagram(ctx);
                break;
            case 'parallel-basic':
                this.drawParallelLinesDiagram(ctx);
                break;
            case 'midpoint-basic':
                this.drawMidpointDiagram(ctx);
                break;
            default:
                this.drawPlaceholderDiagram(ctx);
        }

        ctx.restore();
    }

    drawTriangleDiagram(ctx) {
        const points = [
            { x: 0, y: -80 },
            { x: -100, y: 80 },
            { x: 100, y: 80 }
        ];

        // 三角形
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();

        // 頂点
        ctx.fillStyle = '#e74c3c';
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('A', points[0].x - 5, points[0].y - 15);
        ctx.fillText('B', points[1].x - 20, points[1].y + 5);
        ctx.fillText('C', points[2].x + 15, points[2].y + 5);

        // 角度マーク
        this.drawAngleMark(ctx, points[1], points[0], points[2], 25);
        this.drawAngleMark(ctx, points[0], points[1], points[2], 25);
        this.drawAngleMark(ctx, points[0], points[2], points[1], 25);
    }

    drawTriangleParallelDiagram(ctx) {
        const points = [
            { x: 0, y: -80 },
            { x: -100, y: 80 },
            { x: 100, y: 80 }
        ];

        // 三角形
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();

        // 平行線
        ctx.strokeStyle = '#e74c3c';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(-150, points[0].y);
        ctx.lineTo(150, points[0].y);
        ctx.stroke();
        ctx.setLineDash([]);

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('ℓ', -160, points[0].y);
    }

    drawRightTriangleDiagram(ctx) {
        const points = [
            { x: -80, y: 60 },
            { x: -80, y: -60 },
            { x: 80, y: 60 }
        ];

        // 三角形
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();

        // 直角マーク
        const size = 15;
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y - size);
        ctx.lineTo(points[0].x + size, points[0].y - size);
        ctx.lineTo(points[0].x + size, points[0].y);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('a', points[0].x - 20, points[0].y - 20);
        ctx.fillText('b', points[1].x + 40, points[1].y + 40);
        ctx.fillText('c', (points[1].x + points[2].x) / 2, points[1].y - 20);
    }

    drawPythagoreanSquareDiagram(ctx) {
        const size = 120;
        
        // 外側の正方形
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.strokeRect(-size, -size, size * 2, size * 2);

        // 内側の4つの三角形
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        
        // 三角形1
        ctx.beginPath();
        ctx.moveTo(-size, -size);
        ctx.lineTo(20, -size);
        ctx.lineTo(-size, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 中央の正方形
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.fillRect(-40, -40, 80, 80);
        ctx.strokeRect(-40, -40, 80, 80);

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('c²', -10, 10);
    }

    drawCircleAngleDiagram(ctx) {
        const radius = 100;

        // 円
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 中心
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // 点A, B, C
        const pointA = { x: radius * Math.cos(-Math.PI / 6), y: radius * Math.sin(-Math.PI / 6) };
        const pointB = { x: radius * Math.cos(-5 * Math.PI / 6), y: radius * Math.sin(-5 * Math.PI / 6) };
        const pointC = { x: radius * Math.cos(Math.PI / 2), y: radius * Math.sin(Math.PI / 2) };

        [pointA, pointB, pointC].forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // 線分
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pointA.x, pointA.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();

        ctx.strokeStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(pointC.x, pointC.y);
        ctx.lineTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('O', 10, -10);
        ctx.fillText('A', pointA.x + 10, pointA.y);
        ctx.fillText('B', pointB.x - 20, pointB.y);
        ctx.fillText('C', pointC.x, pointC.y - 15);
    }

    drawParallelLinesDiagram(ctx) {
        // 平行線
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(-120, -40);
        ctx.lineTo(120, -40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-120, 40);
        ctx.lineTo(120, 40);
        ctx.stroke();

        // 交わる線
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-80, -80);
        ctx.lineTo(80, 80);
        ctx.stroke();

        // 角度マーク
        this.drawAngleArc(ctx, 20, -40, 30, -Math.PI / 4, 0);
        this.drawAngleArc(ctx, -20, 40, 30, Math.PI * 3 / 4, Math.PI);

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('ℓ', -130, -40);
        ctx.fillText('m', -130, 40);
        ctx.fillText('∠1', 30, -30);
        ctx.fillText('∠2', -40, 50);
    }

    drawMidpointDiagram(ctx) {
        const points = [
            { x: 0, y: -80 },
            { x: -100, y: 80 },
            { x: 100, y: 80 }
        ];

        // 三角形
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();

        // 中点
        const midAB = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const midAC = { x: (points[0].x + points[2].x) / 2, y: (points[0].y + points[2].y) / 2 };

        // 中点を結ぶ線分
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(midAB.x, midAB.y);
        ctx.lineTo(midAC.x, midAC.y);
        ctx.stroke();

        // 中点の印
        ctx.fillStyle = '#e74c3c';
        [midAB, midAC].forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('A', points[0].x - 5, points[0].y - 15);
        ctx.fillText('B', points[1].x - 20, points[1].y + 5);
        ctx.fillText('C', points[2].x + 15, points[2].y + 5);
        ctx.fillText('M', midAB.x - 20, midAB.y);
        ctx.fillText('N', midAC.x + 15, midAC.y);
    }

    drawPlaceholderDiagram(ctx) {
        ctx.fillStyle = '#95a5a6';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('図は準備中です', 0, 0);
    }

    drawAngleMark(ctx, vertex, p1, p2, radius) {
        const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
        const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);

        ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, radius, angle1, angle2);
        ctx.stroke();
    }

    drawAngleArc(ctx, x, y, radius, startAngle, endAngle) {
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
    }
}

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.ProofSystem = ProofSystem;
}
