// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        
        // Game settings
        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.lastTime = 0;
        
        // Settings
        this.startingLevel = 1;
        this.ghostPieceEnabled = true;
        this.soundEnabled = true;
        
        // Game board
        this.board = this.createBoard();
        
        // Current and next pieces
        this.currentPiece = null;
        this.nextPiece = null;
        
        // High score
        this.highScore = this.loadHighScore();
        
        // Tetris pieces (tetrominoes)
        this.pieces = {
            'I': [
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]
            ],
            'O': [
                [0,0,0,0],
                [0,1,1,0],
                [0,1,1,0],
                [0,0,0,0]
            ],
            'T': [
                [0,0,0],
                [1,1,1],
                [0,1,0]
            ],
            'S': [
                [0,0,0],
                [0,1,1],
                [1,1,0]
            ],
            'Z': [
                [0,0,0],
                [1,1,0],
                [0,1,1]
            ],
            'J': [
                [0,0,0],
                [1,1,1],
                [0,0,1]
            ],
            'L': [
                [0,0,0],
                [1,1,1],
                [1,0,0]
            ]
        };
        
        this.pieceColors = {
            'I': '#00f5ff',
            'O': '#ffd700',
            'T': '#9932cc',
            'S': '#32cd32',
            'Z': '#ff4500',
            'J': '#0000ff',
            'L': '#ff8c00'
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        
        this.initializeGame();
    }
    
    createBoard() {
        return Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateUI();
        this.drawBoard();
        this.drawNextPiece();
    }
    
    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) {
                if (e.code === 'KeyP') {
                    this.togglePause();
                }
                return;
            }
            
            switch(e.code) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    e.preventDefault();
                    break;
                case 'Space':
                    this.hardDrop();
                    e.preventDefault();
                    break;
                case 'KeyP':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });
        
        // Settings
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.startingLevel = parseInt(e.target.value);
        });
        
        document.getElementById('ghostPiece').addEventListener('click', () => {
            this.toggleGhostPiece();
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('resetScores').addEventListener('click', () => {
            this.resetHighScore();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.score = 0;
        this.level = this.startingLevel;
        this.lines = 0;
        this.board = this.createBoard();
        
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        this.hideOverlay();
        this.updateUI();
        this.playSound('start');
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (!this.gamePaused) {
            this.dropTime += deltaTime;
            
            const dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            
            if (this.dropTime > dropInterval) {
                this.movePiece(0, 1);
                this.dropTime = 0;
            }
        }
        
        this.draw();
        this.lastTime = currentTime;
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    createPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        return {
            type: type,
            shape: this.pieces[type],
            x: Math.floor(this.COLS / 2) - Math.floor(this.pieces[type][0].length / 2),
            y: 0,
            color: this.pieceColors[type]
        };
    }
    
    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            
            if (dx !== 0) {
                this.playSound('move');
            }
        } else if (dy > 0) {
            // Piece has landed
            this.placePiece();
            this.clearLines();
            this.spawnNextPiece();
        }
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const kicks = this.getWallKicks(this.currentPiece.shape, rotated);
        
        for (let kick of kicks) {
            const newX = this.currentPiece.x + kick.x;
            const newY = this.currentPiece.y + kick.y;
            
            if (this.isValidPosition(rotated, newX, newY)) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x = newX;
                this.currentPiece.y = newY;
                this.playSound('rotate');
                return;
            }
        }
    }
    
    rotateMatrix(matrix) {
        const N = matrix.length;
        const rotated = Array(N).fill().map(() => Array(N).fill(0));
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                rotated[j][N - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    getWallKicks(original, rotated) {
        // Simple wall kick system
        return [
            { x: 0, y: 0 },   // No kick
            { x: -1, y: 0 },  // Left
            { x: 1, y: 0 },   // Right
            { x: 0, y: -1 },  // Up
            { x: -1, y: -1 }, // Left-up
            { x: 1, y: -1 }   // Right-up
        ];
    }
    
    hardDrop() {
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            this.score += 2; // Bonus points for hard drop
        }
        this.placePiece();
        this.clearLines();
        this.spawnNextPiece();
        this.playSound('hardDrop');
    }
    
    isValidPosition(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return false;
                    }
                    
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = this.currentPiece.x + col;
                    const y = this.currentPiece.y + row;
                    
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
        this.playSound('place');
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // Scoring system
            const lineScores = [0, 100, 300, 500, 800];
            this.score += lineScores[linesCleared] * this.level;
            
            // Level progression
            const newLevel = Math.floor(this.lines / 10) + this.startingLevel;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.playSound('levelUp');
                
                // Visual feedback for level up
                document.getElementById('level').classList.add('level-up-animation');
                setTimeout(() => {
                    document.getElementById('level').classList.remove('level-up-animation');
                }, 800);
            }
            
            this.playSound('lineClear');
            this.updateUI();
        }
    }
    
    spawnNextPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Check for game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showOverlay('New High Score!', `Incredible! You scored ${this.score} points!`, 'Play Again');
            this.playSound('highScore');
        } else {
            this.showOverlay('Game Over!', `Final Score: ${this.score}\\nLevel Reached: ${this.level}`, 'Try Again');
            this.playSound('gameOver');
        }
        
        this.updateUI();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('Paused', 'Press P to resume', 'Resume');
            document.getElementById('pauseBtn').style.display = 'inline-block';
        } else {
            this.hideOverlay();
        }
    }
    
    getGhostPiecePosition() {
        if (!this.ghostPieceEnabled || !this.currentPiece) return null;
        
        let ghostY = this.currentPiece.y;
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        
        return {
            ...this.currentPiece,
            y: ghostY
        };
    }
    
    draw() {
        this.drawBoard();
        this.drawNextPiece();
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row <= this.ROWS; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, row * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        for (let col = 0; col <= this.COLS; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(col * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw placed blocks
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.board[row][col]);
                }
            }
        }
        
        // Draw ghost piece
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            const ghostPiece = this.getGhostPiecePosition();
            if (ghostPiece && ghostPiece.y !== this.currentPiece.y) {
                this.drawPiece(ghostPiece, true);
            }
        }
        
        // Draw current piece
        if (this.gameRunning && !this.gamePaused && this.currentPiece) {
            this.drawPiece(this.currentPiece, false);
        }
    }
    
    drawPiece(piece, isGhost) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const x = (piece.x + col) * this.BLOCK_SIZE;
                    const y = (piece.y + row) * this.BLOCK_SIZE;
                    
                    if (isGhost) {
                        this.drawGhostBlock(x, y, piece.color);
                    } else {
                        this.drawBlock(x, y, piece.color);
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
        
        // Highlight
        this.ctx.fillStyle = this.lightenColor(color, 0.3);
        this.ctx.fillRect(x + 2, y + 2, this.BLOCK_SIZE - 4, 4);
        this.ctx.fillRect(x + 2, y + 2, 4, this.BLOCK_SIZE - 4);
        
        // Shadow
        this.ctx.fillStyle = this.darkenColor(color, 0.3);
        this.ctx.fillRect(x + this.BLOCK_SIZE - 6, y + 2, 4, this.BLOCK_SIZE - 4);
        this.ctx.fillRect(x + 2, y + this.BLOCK_SIZE - 6, this.BLOCK_SIZE - 4, 4);
    }
    
    drawGhostBlock(x, y, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.strokeRect(x + 2, y + 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4);
        this.ctx.setLineDash([]);
    }
    
    drawNextPiece() {
        // Clear next canvas
        this.nextCtx.fillStyle = '#2c3e50';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const shape = this.nextPiece.shape;
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const x = offsetX + col * blockSize;
                        const y = offsetY + row * blockSize;
                        
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
                    }
                }
            }
        }
    }
    
    lightenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    darkenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
    
    showOverlay(title, message, buttonText) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('startBtn').textContent = buttonText;
        document.getElementById('pauseBtn').style.display = 'none';
        this.overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
        document.getElementById('pauseBtn').style.display = this.gameRunning ? 'inline-block' : 'none';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('highScore').textContent = this.highScore.toLocaleString();
    }
    
    toggleGhostPiece() {
        this.ghostPieceEnabled = !this.ghostPieceEnabled;
        const btn = document.getElementById('ghostPiece');
        btn.textContent = this.ghostPieceEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', this.ghostPieceEnabled);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
        btn.classList.toggle('active', this.soundEnabled);
    }
    
    resetHighScore() {
        if (confirm('Are you sure you want to reset the high score?')) {
            this.highScore = 0;
            this.saveHighScore();
            this.updateUI();
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            start: { freq: 440, duration: 0.1 },
            move: { freq: 200, duration: 0.05 },
            rotate: { freq: 300, duration: 0.1 },
            place: { freq: 150, duration: 0.1 },
            lineClear: { freq: 500, duration: 0.3 },
            hardDrop: { freq: 100, duration: 0.2 },
            levelUp: { freq: 660, duration: 0.5 },
            gameOver: { freq: 220, duration: 0.8 },
            highScore: { freq: 880, duration: 0.6 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        oscillator.type = type === 'lineClear' || type === 'levelUp' ? 'sine' : 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('tetrisHighScore')) || 0;
    }
    
    saveHighScore() {
        localStorage.setItem('tetrisHighScore', this.highScore.toString());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
