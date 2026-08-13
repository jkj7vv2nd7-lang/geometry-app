// ===== アニメーション機能 =====

class AnimationController {
    constructor() {
        this.animationId = null;
        this.isRunning = false;
        this.currentType = null;
        this.speed = 5;
        this.frame = 0;
        this.originalShapes = [];
    }

    init() {
        // アニメーションモーダルのイベントリスナー
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.animation;
                this.startAnimation(type);
            });
        });

        document.getElementById('playAnimation').addEventListener('click', () => this.play());
        document.getElementById('pauseAnimation').addEventListener('click', () => this.pause());
        document.getElementById('stopAnimation').addEventListener('click', () => this.stop());
        document.getElementById('resetAnimation').addEventListener('click', () => this.reset());

        // スライダー
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedDisplay').textContent = e.target.value;
        });

        document.getElementById('rotationAngle').addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            document.getElementById('angleDisplay').textContent = angle + '°';
            if (this.currentType === 'rotate' && !this.isRunning) {
                this.applyManualRotation(angle);
            }
        });

        document.getElementById('scaleValue').addEventListener('input', (e) => {
            const scale = parseInt(e.target.value);
            document.getElementById('scaleDisplay').textContent = scale + '%';
            if (this.currentType === 'scale' && !this.isRunning) {
                this.applyManualScale(scale / 100);
            }
        });
    }

    startAnimation(type) {
        if (window.shapes.length === 0) {
            alert('アニメーションする図形がありません。先に図形を描画してください。');
            return;
        }

        this.currentType = type;
        this.saveOriginalShapes();
        this.updateDescription(type);
        this.play();
    }

    play() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }

    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    stop() {
        this.pause();
        this.reset();
    }

    reset() {
        this.pause();
        this.frame = 0;
        this.restoreOriginalShapes();
        window.redraw();
        
        // スライダーをリセット
        document.getElementById('rotationAngle').value = 0;
        document.getElementById('angleDisplay').textContent = '0°';
        document.getElementById('scaleValue').value = 100;
        document.getElementById('scaleDisplay').textContent = '100%';
    }

    saveOriginalShapes() {
        this.originalShapes = window.shapes.map(shape => ({
            shape: shape,
            originalPoints: shape.points.map(p => ({ x: p.x, y: p.y }))
        }));
    }

    restoreOriginalShapes() {
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            shape.points.forEach((point, i) => {
                point.x = originalPoints[i].x;
                point.y = originalPoints[i].y;
            });
        });
    }

    animate() {
        if (!this.isRunning) return;

        this.frame += this.speed / 5;

        switch (this.currentType) {
            case 'rotate':
                this.applyRotation();
                break;
            case 'scale':
                this.applyScale();
                break;
            case 'translate':
                this.applyTranslation();
                break;
            case 'reflect':
                this.applyReflection();
                break;
            case 'morph':
                this.applyMorph();
                break;
            case 'oscillate':
                this.applyOscillation();
                break;
        }

        window.redraw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    applyRotation() {
        const angle = (this.frame * Math.PI / 180) % (2 * Math.PI);
        
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            const center = this.getShapeCenter(originalPoints);
            
            shape.points.forEach((point, i) => {
                const dx = originalPoints[i].x - center.x;
                const dy = originalPoints[i].y - center.y;
                
                point.x = center.x + dx * Math.cos(angle) - dy * Math.sin(angle);
                point.y = center.y + dx * Math.sin(angle) + dy * Math.cos(angle);
            });
        });
    }

    applyManualRotation(degrees) {
        const angle = degrees * Math.PI / 180;
        
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            const center = this.getShapeCenter(originalPoints);
            
            shape.points.forEach((point, i) => {
                const dx = originalPoints[i].x - center.x;
                const dy = originalPoints[i].y - center.y;
                
                point.x = center.x + dx * Math.cos(angle) - dy * Math.sin(angle);
                point.y = center.y + dx * Math.sin(angle) + dy * Math.cos(angle);
            });
        });
        
        window.redraw();
    }

    applyScale() {
        const scale = 1 + 0.5 * Math.sin(this.frame * Math.PI / 180);
        
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            const center = this.getShapeCenter(originalPoints);
            
            shape.points.forEach((point, i) => {
                const dx = originalPoints[i].x - center.x;
                const dy = originalPoints[i].y - center.y;
                
                point.x = center.x + dx * scale;
                point.y = center.y + dy * scale;
            });
        });
    }

    applyManualScale(scale) {
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            const center = this.getShapeCenter(originalPoints);
            
            shape.points.forEach((point, i) => {
                const dx = originalPoints[i].x - center.x;
                const dy = originalPoints[i].y - center.y;
                
                point.x = center.x + dx * scale;
                point.y = center.y + dy * scale;
            });
        });
        
        window.redraw();
    }

    applyTranslation() {
        const offsetX = 50 * Math.sin(this.frame * Math.PI / 180);
        const offsetY = 30 * Math.cos(this.frame * Math.PI / 180);
        
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            shape.points.forEach((point, i) => {
                point.x = originalPoints[i].x + offsetX;
                point.y = originalPoints[i].y + offsetY;
            });
        });
    }

    applyReflection() {
        const t = (Math.sin(this.frame * Math.PI / 180) + 1) / 2;
        const canvas = document.getElementById('mainCanvas');
        const centerX = canvas.width / 2;
        
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            shape.points.forEach((point, i) => {
                const reflected = centerX + (centerX - originalPoints[i].x);
                point.x = originalPoints[i].x + (reflected - originalPoints[i].x) * t;
                point.y = originalPoints[i].y;
            });
        });
    }

    applyMorph() {
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            shape.points.forEach((point, i) => {
                const offset = 30 * Math.sin(this.frame * Math.PI / 180 + i * Math.PI / 2);
                point.x = originalPoints[i].x + offset;
                point.y = originalPoints[i].y + offset * Math.cos(i);
            });
        });
    }

    applyOscillation() {
        this.originalShapes.forEach(({ shape, originalPoints }) => {
            shape.points.forEach((point, i) => {
                const amplitude = 20;
                const frequency = 2;
                const offset = amplitude * Math.sin(this.frame * Math.PI / 180 * frequency + i * Math.PI / originalPoints.length);
                point.y = originalPoints[i].y + offset;
            });
        });
    }

    getShapeCenter(points) {
        const sum = points.reduce((acc, p) => ({
            x: acc.x + p.x,
            y: acc.y + p.y
        }), { x: 0, y: 0 });
        
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }

    updateDescription(type) {
        const descriptions = {
            'rotate': {
                title: '回転変換',
                content: '図形を中心点の周りに回転させます。回転は図形の形や大きさを変えない変換（合同変換）です。',
                points: [
                    '回転の中心：図形の重心',
                    '回転角：0°〜360°',
                    '図形の形は変わらない',
                    '回転対称性を観察できる'
                ]
            },
            'scale': {
                title: '拡大・縮小',
                content: '図形の大きさを変更します。中心点からの距離を一定の比率で変えます。',
                points: [
                    '拡大の中心：図形の重心',
                    '相似な図形が得られる',
                    '形は変わらない',
                    '辺の長さの比は一定'
                ]
            },
            'translate': {
                title: '平行移動',
                content: '図形を一定の方向に移動させます。すべての点が同じ方向・同じ距離だけ移動します。',
                points: [
                    '移動方向と距離が一定',
                    '形も大きさも変わらない',
                    '合同な図形が得られる',
                    '対応する辺は平行'
                ]
            },
            'reflect': {
                title: '対称移動（鏡映）',
                content: '図形を軸に対して反転させます。鏡に映したような変換です。',
                points: [
                    '対称の軸：画面中央',
                    '軸からの距離は等しい',
                    '形も大きさも変わらない',
                    '線対称の性質を理解'
                ]
            },
            'morph': {
                title: '変形',
                content: '図形を連続的に変形させます。各頂点が独立して動きます。',
                points: [
                    '各頂点が異なる動き',
                    '図形の連続的な変化',
                    '位相幾何学的な視点',
                    '図形の柔軟性を理解'
                ]
            },
            'oscillate': {
                title: '振動',
                content: '図形が上下に振動します。波のような動きを観察できます。',
                points: [
                    '周期的な運動',
                    '振幅と周波数',
                    '波動の理解',
                    '三角関数の応用'
                ]
            }
        };

        const desc = descriptions[type];
        if (desc) {
            const html = `
                <h4>${desc.title}</h4>
                <p>${desc.content}</p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    ${desc.points.map(p => `<li>${p}</li>`).join('')}
                </ul>
            `;
            document.getElementById('animationDescription').innerHTML = html;
        }
    }
}

// グローバルにエクスポート
if (typeof window !== 'undefined') {
    window.AnimationController = AnimationController;
}
