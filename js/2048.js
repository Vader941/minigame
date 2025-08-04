// 2048 Game Implementation
class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.moves = 0;
        this.undoStack = [];
        this.undoCount = 3;
        
        // Game state
        this.gameRunning = false;
        this.gameWon = false;
        this.gameOver = false;
        
        // Settings
        this.animationsEnabled = true;
        this.soundEnabled = true;
        this.theme = 'classic';
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateUI();
        this.setupGrid();
        this.showOverlay('2048 Puzzle', 'Swipe or use arrow keys to move tiles. When two tiles with the same number touch, they merge into one!', 'Start Playing');
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gameOver) {
                if (e.code === 'Space') {
                    this.newGame();
                    e.preventDefault();
                }
                return;
            }
            
            let moved = false;
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    moved = this.move('left');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    moved = this.move('right');
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    moved = this.move('up');
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    moved = this.move('down');
                    e.preventDefault();
                    break;
                case 'KeyU':
                    this.undo();
                    e.preventDefault();
                    break;
                case 'Space':
                    this.newGame();
                    e.preventDefault();
                    break;
            }
            
            if (moved) {
                this.afterMove();
            }
        });
        
        // Touch controls
        let startX, startY;
        const container = document.getElementById('gridContainer');
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            e.preventDefault();
        });
        
        container.addEventListener('touchend', (e) => {
            if (!startX || !startY || !this.gameRunning || this.gameOver) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 50) {
                    if (this.move('left')) this.afterMove();
                } else if (diffX < -50) {
                    if (this.move('right')) this.afterMove();
                }
            } else {
                // Vertical swipe
                if (diffY > 50) {
                    if (this.move('up')) this.afterMove();
                } else if (diffY < -50) {
                    if (this.move('down')) this.afterMove();
                }
            }
            
            startX = null;
            startY = null;
            e.preventDefault();
        });
        
        // Button controls
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('overlayBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
        
        // Settings
        document.getElementById('gridSize').addEventListener('change', (e) => {
            this.changeGridSize(parseInt(e.target.value));
        });
        
        document.getElementById('animations').addEventListener('click', () => {
            this.toggleAnimations();
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('colorTheme').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        document.getElementById('resetStats').addEventListener('click', () => {
            this.resetStatistics();
        });
    }
    
    setupGrid() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.updateGridDisplay();
    }
    
    updateGridDisplay() {
        const container = document.getElementById('gridContainer');
        const tileContainer = document.getElementById('tileContainer');
        
        // Update grid size
        const cellSize = 70;
        const gap = 10;
        const containerSize = this.size * cellSize + (this.size + 1) * gap;
        
        container.style.width = `${containerSize}px`;
        container.style.height = `${containerSize}px`;
        container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        
        tileContainer.style.width = `${containerSize}px`;
        tileContainer.style.height = `${containerSize}px`;
        
        // Clear and rebuild grid
        container.innerHTML = '';
        for (let row = 0; row < this.size; row++) {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            gridRow.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
            
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                gridRow.appendChild(cell);
            }
            
            container.appendChild(gridRow);
        }
        
        this.renderTiles();
    }
    
    newGame() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.moves = 0;
        this.undoCount = 3;
        this.undoStack = [];
        this.gameRunning = true;
        this.gameWon = false;
        this.gameOver = false;
        
        this.hideOverlay();
        this.addRandomTile();
        this.addRandomTile();
        this.updateUI();
        this.renderTiles();
        this.playSound('start');
    }
    
    restart() {
        if (confirm('Are you sure you want to restart? Your current progress will be lost.')) {
            this.newGame();
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            return true;
        }
        
        return false;
    }
    
    move(direction) {
        this.saveState();
        
        let moved = false;
        const newGrid = this.grid.map(row => [...row]);
        
        if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                const { line, hasMoved } = this.processLine(this.grid[row]);
                newGrid[row] = line;
                moved = moved || hasMoved;
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                const { line, hasMoved } = this.processLine(this.grid[row].slice().reverse());
                newGrid[row] = line.reverse();
                moved = moved || hasMoved;
            }
        } else if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                const column = this.grid.map(row => row[col]);
                const { line, hasMoved } = this.processLine(column);
                for (let row = 0; row < this.size; row++) {
                    newGrid[row][col] = line[row];
                }
                moved = moved || hasMoved;
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                const column = this.grid.map(row => row[col]).reverse();
                const { line, hasMoved } = this.processLine(column);
                const reversedLine = line.reverse();
                for (let row = 0; row < this.size; row++) {
                    newGrid[row][col] = reversedLine[row];
                }
                moved = moved || hasMoved;
            }
        }
        
        if (moved) {
            this.grid = newGrid;
            this.moves++;
        } else {
            this.undoStack.pop(); // Remove the saved state since no move was made
        }
        
        return moved;
    }
    
    processLine(line) {
        const filtered = line.filter(cell => cell !== 0);
        const merged = [];
        let hasMoved = false;
        let scoreIncrease = 0;
        
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                // Merge tiles
                const newValue = filtered[i] * 2;
                merged.push(newValue);
                scoreIncrease += newValue;
                i++; // Skip the next tile as it's been merged
                hasMoved = true;
                
                // Check for 2048 win condition
                if (newValue === 2048 && !this.gameWon) {
                    this.gameWon = true;
                    setTimeout(() => {
                        this.showWinMessage();
                    }, 300);
                }
            } else {
                merged.push(filtered[i]);
            }
        }
        
        // Fill with zeros
        while (merged.length < this.size) {
            merged.push(0);
        }
        
        // Check if line has moved
        for (let i = 0; i < this.size; i++) {
            if (line[i] !== merged[i]) {
                hasMoved = true;
                break;
            }
        }
        
        if (scoreIncrease > 0) {
            this.score += scoreIncrease;
            this.animateScore(scoreIncrease);
            this.playSound('merge');
        }
        
        return { line: merged, hasMoved };
    }
    
    afterMove() {
        this.addRandomTile();
        this.renderTiles();
        this.updateUI();
        this.updateProgress();
        
        if (this.isGameOver()) {
            this.gameOver = true;
            this.gameRunning = false;
            setTimeout(() => {
                this.showGameOverMessage();
            }, 500);
        }
        
        this.playSound('move');
    }
    
    isGameOver() {
        // Check for empty cells
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) return false;
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.grid[row][col];
                
                // Check right neighbor
                if (col < this.size - 1 && this.grid[row][col + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < this.size - 1 && this.grid[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    saveState() {
        const state = {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            moves: this.moves
        };
        
        this.undoStack.push(state);
        
        // Keep only last 10 states
        if (this.undoStack.length > 10) {
            this.undoStack.shift();
        }
    }
    
    undo() {
        if (this.undoCount <= 0 || this.undoStack.length === 0 || !this.gameRunning) return;
        
        const lastState = this.undoStack.pop();
        this.grid = lastState.grid;
        this.score = lastState.score;
        this.moves = lastState.moves;
        this.undoCount--;
        
        this.renderTiles();
        this.updateUI();
        this.playSound('undo');
    }
    
    renderTiles() {
        const container = document.getElementById('tileContainer');
        container.innerHTML = '';
        
        const cellSize = 70;
        const gap = 10;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = this.grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    const x = col * (cellSize + gap) + gap;
                    const y = row * (cellSize + gap) + gap;
                    
                    tile.style.left = `${x}px`;
                    tile.style.top = `${y}px`;
                    
                    if (this.animationsEnabled) {
                        tile.classList.add('tile-new');
                    }
                    
                    container.appendChild(tile);
                }
            }
        }
    }
    
    animateScore(points) {
        const scoreElement = document.getElementById('score');
        const rect = scoreElement.getBoundingClientRect();
        
        const animation = document.createElement('div');
        animation.className = 'score-animation';
        animation.textContent = `+${points}`;
        animation.style.left = `${rect.left + rect.width / 2}px`;
        animation.style.top = `${rect.top}px`;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1000);
    }
    
    updateProgress() {
        const highestTile = Math.max(...this.grid.flat());
        const progress = Math.log2(highestTile / 2) / Math.log2(1024) * 100; // Progress to 2048
        
        document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('highestTile').textContent = highestTile;
        
        let progressText = 'Just Started!';
        if (highestTile >= 32) progressText = 'Getting Warmed Up!';
        if (highestTile >= 128) progressText = 'Making Progress!';
        if (highestTile >= 512) progressText = 'Halfway There!';
        if (highestTile >= 1024) progressText = 'Almost There!';
        if (highestTile >= 2048) progressText = 'Champion! 🏆';
        
        document.getElementById('progressText').textContent = progressText;
    }
    
    showWinMessage() {
        this.playSound('win');
        this.showOverlay('You Win! 🎉', `Congratulations! You reached 2048!\\n\\nScore: ${this.score}\\nMoves: ${this.moves}\\n\\nKeep playing to reach even higher numbers!`, 'Continue Playing');
    }
    
    showGameOverMessage() {
        const highestTile = Math.max(...this.grid.flat());
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
            this.playSound('newRecord');
            this.showOverlay('New High Score! 🏆', `Amazing! You set a new record!\\n\\nScore: ${this.score}\\nHighest Tile: ${highestTile}\\nMoves: ${this.moves}`, 'Try Again');
        } else {
            this.playSound('gameOver');
            this.showOverlay('Game Over!', `Good effort!\\n\\nScore: ${this.score}\\nHighest Tile: ${highestTile}\\nMoves: ${this.moves}`, 'Try Again');
        }
    }
    
    changeGridSize(newSize) {
        if (this.gameRunning) {
            if (!confirm('Changing grid size will start a new game. Continue?')) {
                document.getElementById('gridSize').value = this.size;
                return;
            }
        }
        
        this.size = newSize;
        this.setupGrid();
        this.newGame();
    }
    
    showOverlay(title, message, buttonText) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('overlayBtn').textContent = buttonText;
        document.getElementById('gameOverlay').style.display = 'flex';
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('bestScore').textContent = this.bestScore.toLocaleString();
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('undoBtn').textContent = `Undo (${this.undoCount})`;
        document.getElementById('undoBtn').disabled = this.undoCount === 0 || this.undoStack.length === 0;
    }
    
    toggleAnimations() {
        this.animationsEnabled = !this.animationsEnabled;
        const btn = document.getElementById('animations');
        btn.textContent = this.animationsEnabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', this.animationsEnabled);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
        btn.classList.toggle('active', this.soundEnabled);
    }
    
    changeTheme(newTheme) {
        document.body.className = `theme-${newTheme}`;
        this.theme = newTheme;
    }
    
    resetStatistics() {
        if (confirm('Are you sure you want to reset your best score?')) {
            this.bestScore = 0;
            this.saveBestScore();
            this.updateUI();
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            start: { freq: 440, duration: 0.2 },
            move: { freq: 220, duration: 0.1 },
            merge: { freq: 330, duration: 0.2 },
            undo: { freq: 180, duration: 0.15 },
            win: { freq: 660, duration: 1.0 },
            gameOver: { freq: 150, duration: 0.8 },
            newRecord: { freq: 880, duration: 1.2 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }
    
    loadBestScore() {
        return parseInt(localStorage.getItem('2048BestScore')) || 0;
    }
    
    saveBestScore() {
        localStorage.setItem('2048BestScore', this.bestScore.toString());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
