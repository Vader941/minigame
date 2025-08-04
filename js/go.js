// Go Game Implementation
class GoGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        
        // Game settings
        this.boardSize = 13;
        this.cellSize = 0;
        this.stoneRadius = 0;
        this.boardMargin = 40;
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.currentPlayer = 'black'; // 'black' or 'white'
        this.moveCount = 0;
        this.passCount = 0;
        this.soundEnabled = true;
        this.showCoords = false;
        
        // Board representation (0 = empty, 1 = black, 2 = white)
        this.board = [];
        this.boardHistory = [];
        this.koPosition = null;
        
        // Captures
        this.blackCaptures = 0;
        this.whiteCaptures = 0;
        
        // Initialize game
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupBoard();
        this.setupEventListeners();
        this.updateUI();
        this.drawBoard();
    }
    
    setupBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.calculateDimensions();
    }
    
    calculateDimensions() {
        const availableSize = this.canvas.width - (this.boardMargin * 2);
        this.cellSize = availableSize / (this.boardSize - 1);
        this.stoneRadius = this.cellSize * 0.4;
    }
    
    setupEventListeners() {
        // Canvas click
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameRunning || this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridPos = this.getGridPosition(x, y);
            if (gridPos) {
                this.attemptMove(gridPos.col, gridPos.row);
            }
        });
        
        // Canvas hover for preview
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning || this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridPos = this.getGridPosition(x, y);
            this.hoverPosition = gridPos;
            this.drawBoard();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverPosition = null;
            this.drawBoard();
        });
        
        // Game controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('passBtn').addEventListener('click', () => {
            this.passTurn();
        });
        
        document.getElementById('resignBtn').addEventListener('click', () => {
            this.resign();
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Settings
        document.getElementById('boardSize').addEventListener('change', (e) => {
            this.changeBoardSize(parseInt(e.target.value));
        });
        
        document.getElementById('handicap').addEventListener('change', (e) => {
            this.setHandicap(parseInt(e.target.value));
        });
        
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.getElementById('showCoords').addEventListener('click', () => {
            this.toggleCoordinates();
        });
    }
    
    getGridPosition(x, y) {
        const boardX = x - this.boardMargin;
        const boardY = y - this.boardMargin;
        
        const col = Math.round(boardX / this.cellSize);
        const row = Math.round(boardY / this.cellSize);
        
        if (col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize) {
            // Check if click is close enough to intersection
            const snapX = col * this.cellSize + this.boardMargin;
            const snapY = row * this.cellSize + this.boardMargin;
            const distance = Math.sqrt((x - snapX) ** 2 + (y - snapY) ** 2);
            
            if (distance <= this.stoneRadius) {
                return { col, row };
            }
        }
        
        return null;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.currentPlayer = 'black';
        this.moveCount = 0;
        this.passCount = 0;
        this.blackCaptures = 0;
        this.whiteCaptures = 0;
        this.koPosition = null;
        
        this.setupBoard();
        this.hideOverlay();
        this.updateUI();
        this.drawBoard();
        this.playSound('start');
    }
    
    newGame() {
        this.startGame();
    }
    
    attemptMove(col, row) {
        // Check if position is empty
        if (this.board[row][col] !== 0) {
            this.playSound('invalid');
            return false;
        }
        
        // Create temporary board to test the move
        const tempBoard = this.copyBoard();
        const playerStone = this.currentPlayer === 'black' ? 1 : 2;
        tempBoard[row][col] = playerStone;
        
        // Check for captures
        const opponentStone = this.currentPlayer === 'black' ? 2 : 1;
        const capturedGroups = this.getCapturedGroups(tempBoard, opponentStone);
        
        // Remove captured stones
        for (let group of capturedGroups) {
            for (let pos of group) {
                tempBoard[pos.row][pos.col] = 0;
            }
        }
        
        // Check if the move is suicidal (no liberties and no captures)
        if (capturedGroups.length === 0) {
            const liberties = this.getLiberties(tempBoard, col, row);
            if (liberties === 0) {
                this.playSound('invalid');
                return false;
            }
        }
        
        // Check Ko rule (simple implementation)
        if (this.isKoViolation(tempBoard)) {
            this.playSound('invalid');
            return false;
        }
        
        // Valid move - apply it
        this.board = tempBoard;
        this.moveCount++;
        this.passCount = 0;
        
        // Update captures
        let totalCaptured = 0;
        for (let group of capturedGroups) {
            totalCaptured += group.length;
        }
        
        if (this.currentPlayer === 'black') {
            this.blackCaptures += totalCaptured;
        } else {
            this.whiteCaptures += totalCaptured;
        }
        
        // Save board state for Ko rule
        this.boardHistory.push(this.copyBoard());
        if (this.boardHistory.length > 2) {
            this.boardHistory.shift();
        }
        
        // Switch players
        this.switchPlayer();
        this.updateUI();
        this.drawBoard();
        this.playSound('place');
        
        return true;
    }
    
    getCapturedGroups(board, stoneType) {
        const captured = [];
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (board[row][col] === stoneType && !visited[row][col]) {
                    const group = this.getGroup(board, col, row, stoneType, visited);
                    const liberties = this.getGroupLiberties(board, group);
                    
                    if (liberties === 0) {
                        captured.push(group);
                    }
                }
            }
        }
        
        return captured;
    }
    
    getGroup(board, startCol, startRow, stoneType, visited) {
        const group = [];
        const stack = [{ col: startCol, row: startRow }];
        
        while (stack.length > 0) {
            const { col, row } = stack.pop();
            
            if (visited[row][col]) continue;
            if (board[row][col] !== stoneType) continue;
            
            visited[row][col] = true;
            group.push({ col, row });
            
            // Check adjacent positions
            const adjacent = [
                { col: col - 1, row },
                { col: col + 1, row },
                { col, row: row - 1 },
                { col, row: row + 1 }
            ];
            
            for (let pos of adjacent) {
                if (this.isValidPosition(pos.col, pos.row) && !visited[pos.row][pos.col]) {
                    stack.push(pos);
                }
            }
        }
        
        return group;
    }
    
    getGroupLiberties(board, group) {
        const liberties = new Set();
        
        for (let pos of group) {
            const adjacent = [
                { col: pos.col - 1, row: pos.row },
                { col: pos.col + 1, row: pos.row },
                { col: pos.col, row: pos.row - 1 },
                { col: pos.col, row: pos.row + 1 }
            ];
            
            for (let adj of adjacent) {
                if (this.isValidPosition(adj.col, adj.row) && board[adj.row][adj.col] === 0) {
                    liberties.add(`${adj.col},${adj.row}`);
                }
            }
        }
        
        return liberties.size;
    }
    
    getLiberties(board, col, row) {
        const stoneType = board[row][col];
        if (stoneType === 0) return 0;
        
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        const group = this.getGroup(board, col, row, stoneType, visited);
        return this.getGroupLiberties(board, group);
    }
    
    isValidPosition(col, row) {
        return col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize;
    }
    
    isKoViolation(board) {
        if (this.boardHistory.length < 1) return false;
        
        const prevBoard = this.boardHistory[this.boardHistory.length - 1];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (board[row][col] !== prevBoard[row][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    copyBoard() {
        return this.board.map(row => [...row]);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }
    
    passTurn() {
        this.passCount++;
        this.moveCount++;
        
        if (this.passCount >= 2) {
            this.endGame();
        } else {
            this.switchPlayer();
            this.updateUI();
            this.playSound('pass');
        }
    }
    
    resign() {
        const winner = this.currentPlayer === 'black' ? 'White' : 'Black';
        this.showOverlay('Game Over!', `${winner} wins by resignation!`, 'New Game');
        this.gameOver = true;
        this.gameRunning = false;
        this.playSound('gameOver');
    }
    
    endGame() {
        // Simple territory counting (very basic implementation)
        const territory = this.calculateTerritory();
        const blackScore = this.blackCaptures + territory.black;
        const whiteScore = this.whiteCaptures + territory.white + 6.5; // Komi
        
        let winner, message;
        if (blackScore > whiteScore) {
            winner = 'Black';
            message = `Black wins by ${(blackScore - whiteScore).toFixed(1)} points!`;
        } else {
            winner = 'White';
            message = `White wins by ${(whiteScore - blackScore).toFixed(1)} points!`;
        }
        
        this.showOverlay('Game Over!', message, 'New Game');
        this.gameOver = true;
        this.gameRunning = false;
        this.playSound('gameOver');
    }
    
    calculateTerritory() {
        // Very simplified territory calculation
        let blackTerritory = 0;
        let whiteTerritory = 0;
        
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && !visited[row][col]) {
                    const territory = this.getEmptyTerritory(col, row, visited);
                    const owner = this.getTerritoryOwner(territory);
                    
                    if (owner === 'black') {
                        blackTerritory += territory.length;
                    } else if (owner === 'white') {
                        whiteTerritory += territory.length;
                    }
                }
            }
        }
        
        return { black: blackTerritory, white: whiteTerritory };
    }
    
    getEmptyTerritory(startCol, startRow, visited) {
        const territory = [];
        const stack = [{ col: startCol, row: startRow }];
        
        while (stack.length > 0) {
            const { col, row } = stack.pop();
            
            if (visited[row][col]) continue;
            if (this.board[row][col] !== 0) continue;
            
            visited[row][col] = true;
            territory.push({ col, row });
            
            const adjacent = [
                { col: col - 1, row },
                { col: col + 1, row },
                { col, row: row - 1 },
                { col, row: row + 1 }
            ];
            
            for (let pos of adjacent) {
                if (this.isValidPosition(pos.col, pos.row) && !visited[pos.row][pos.col]) {
                    stack.push(pos);
                }
            }
        }
        
        return territory;
    }
    
    getTerritoryOwner(territory) {
        const borders = new Set();
        
        for (let pos of territory) {
            const adjacent = [
                { col: pos.col - 1, row: pos.row },
                { col: pos.col + 1, row: pos.row },
                { col: pos.col, row: pos.row - 1 },
                { col: pos.col, row: pos.row + 1 }
            ];
            
            for (let adj of adjacent) {
                if (this.isValidPosition(adj.col, adj.row)) {
                    const stone = this.board[adj.row][adj.col];
                    if (stone !== 0) {
                        borders.add(stone);
                    }
                }
            }
        }
        
        if (borders.size === 1) {
            return borders.has(1) ? 'black' : 'white';
        }
        
        return null; // Neutral territory
    }
    
    changeBoardSize(size) {
        if (this.gameRunning) return;
        
        this.boardSize = size;
        this.setupBoard();
        this.drawBoard();
    }
    
    setHandicap(stones) {
        if (this.gameRunning || stones === 0) return;
        
        // Standard handicap positions for different board sizes
        const handicapPositions = {
            9: [
                [2, 2], [6, 6], [2, 6], [6, 2], [4, 4]
            ],
            13: [
                [3, 3], [9, 9], [3, 9], [9, 3], [6, 6]
            ],
            19: [
                [3, 3], [15, 15], [3, 15], [15, 3], [9, 9]
            ]
        };
        
        const positions = handicapPositions[this.boardSize] || [];
        
        for (let i = 0; i < Math.min(stones, positions.length); i++) {
            const [col, row] = positions[i];
            this.board[row][col] = 1; // Black stones
        }
        
        this.drawBoard();
    }
    
    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#F5DEB3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            const pos = i * this.cellSize + this.boardMargin;
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardMargin, pos);
            this.ctx.lineTo(this.canvas.width - this.boardMargin, pos);
            this.ctx.stroke();
            
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.boardMargin);
            this.ctx.lineTo(pos, this.canvas.height - this.boardMargin);
            this.ctx.stroke();
        }
        
        // Draw star points
        this.drawStarPoints();
        
        // Draw coordinates if enabled
        if (this.showCoords) {
            this.drawCoordinates();
        }
        
        // Draw stones
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawStone(col, row, this.board[row][col]);
                }
            }
        }
        
        // Draw hover preview
        if (this.hoverPosition && this.gameRunning && !this.gameOver) {
            const { col, row } = this.hoverPosition;
            if (this.board[row][col] === 0) {
                this.drawPreviewStone(col, row);
            }
        }
    }
    
    drawStarPoints() {
        const starPoints = this.getStarPoints();
        
        this.ctx.fillStyle = '#8B4513';
        for (let point of starPoints) {
            const x = point.col * this.cellSize + this.boardMargin;
            const y = point.row * this.cellSize + this.boardMargin;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    getStarPoints() {
        const points = [];
        const mid = Math.floor(this.boardSize / 2);
        const edge = this.boardSize < 13 ? 2 : 3;
        
        if (this.boardSize >= 9) {
            points.push(
                { col: edge, row: edge },
                { col: this.boardSize - 1 - edge, row: edge },
                { col: edge, row: this.boardSize - 1 - edge },
                { col: this.boardSize - 1 - edge, row: this.boardSize - 1 - edge }
            );
            
            if (this.boardSize % 2 === 1) {
                points.push({ col: mid, row: mid });
            }
        }
        
        return points;
    }
    
    drawCoordinates() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        const letters = 'ABCDEFGHJKLMNOPQRST';
        
        for (let i = 0; i < this.boardSize; i++) {
            const pos = i * this.cellSize + this.boardMargin;
            
            // Column labels (letters)
            this.ctx.fillText(letters[i], pos, this.boardMargin - 10);
            this.ctx.fillText(letters[i], pos, this.canvas.height - this.boardMargin + 20);
            
            // Row labels (numbers)
            this.ctx.fillText((this.boardSize - i).toString(), this.boardMargin - 15, pos + 5);
            this.ctx.fillText((this.boardSize - i).toString(), this.canvas.width - this.boardMargin + 15, pos + 5);
        }
    }
    
    drawStone(col, row, stoneType) {
        const x = col * this.cellSize + this.boardMargin;
        const y = row * this.cellSize + this.boardMargin;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, this.stoneRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Stone
        if (stoneType === 1) { // Black
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.stoneRadius);
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else { // White
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.stoneRadius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.stoneRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawPreviewStone(col, row) {
        const x = col * this.cellSize + this.boardMargin;
        const y = row * this.cellSize + this.boardMargin;
        
        this.ctx.strokeStyle = this.currentPlayer === 'black' ? '#333' : '#666';
        this.ctx.setLineDash([3, 3]);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.stoneRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    showOverlay(title, message, buttonText) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('startBtn').textContent = buttonText;
        this.overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('currentPlayer').textContent = 
            this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
        document.getElementById('moveCount').textContent = this.moveCount;
        document.getElementById('blackCaptures').textContent = this.blackCaptures;
        document.getElementById('whiteCaptures').textContent = this.whiteCaptures;
        
        // Update player indicators
        document.getElementById('playerBlack').classList.toggle('current', this.currentPlayer === 'black');
        document.getElementById('playerWhite').classList.toggle('current', this.currentPlayer === 'white');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.soundEnabled ? '🔊 ON' : '🔇 OFF';
        btn.classList.toggle('active', this.soundEnabled);
    }
    
    toggleCoordinates() {
        this.showCoords = !this.showCoords;
        const btn = document.getElementById('showCoords');
        btn.textContent = this.showCoords ? 'ON' : 'OFF';
        btn.classList.toggle('active', this.showCoords);
        this.drawBoard();
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            start: { freq: 440, duration: 0.2 },
            place: { freq: 200, duration: 0.1 },
            invalid: { freq: 150, duration: 0.2 },
            pass: { freq: 300, duration: 0.15 },
            gameOver: { freq: 220, duration: 0.5 }
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
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GoGame();
});
